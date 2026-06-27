import os, uuid, shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import httpx

app=FastAPI(title='AI Data Science Agent API Gateway')
app.add_middleware(CORSMiddleware, allow_origins=os.getenv('CORS_ORIGINS','http://localhost:3000').split(','), allow_methods=['*'], allow_headers=['*'])
UPLOAD=Path('/app/storage/uploads'); REPORT=Path('/app/storage/reports'); UPLOAD.mkdir(parents=True,exist_ok=True); REPORT.mkdir(parents=True,exist_ok=True)
ANALYSES={}
SERV={'profile':'http://profiling-service:8000/profile','plan':'http://planner-service:8000/plan','clean':'http://cleaning-service:8000/clean','viz':'http://visualization-service:8000/visualize','ml':'http://ml-advisor-service:8000/recommend','report':'http://report-service:8000/report'}
ALLOWED_CLEANING_ACTIONS={'drop_duplicates','fill_missing_mean','fill_missing_median','fill_missing_mode','remove_outliers_iqr','drop_column','rename_column','convert_type'}

async def post_json(client:httpx.AsyncClient, service:str, payload:dict):
    try:
        response=await client.post(SERV[service],json=payload)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        detail=exc.response.text[:500] or exc.response.reason_phrase
        raise HTTPException(502,f'{service} service failed: {detail}')
    except httpx.RequestError as exc:
        raise HTTPException(502,f'{service} service unavailable: {exc}')

def sanitize_cleaning_plan(plan:dict):
    clean=[]
    for action in plan.get('cleaning_plan',[]):
        if not isinstance(action,dict) or action.get('action') not in ALLOWED_CLEANING_ACTIONS:
            continue
        clean.append({
            'action':action.get('action'),
            'column':action.get('column'),
            'enabled':bool(action.get('enabled',True)),
            'new_name':action.get('new_name'),
            'dtype':action.get('dtype'),
        })
    plan['cleaning_plan']=clean
    return plan

def public_chart_urls(aid:str, charts:list[dict]):
    public=[]
    for chart in charts:
        item=dict(chart)
        path=Path(str(item.get('url','')))
        item['path']=str(path)
        item['url']=f'/chart/{aid}/{path.name}'
        public.append(item)
    return public

@app.post('/upload')
async def upload(file:UploadFile=File(...)):
    ext=Path(file.filename).suffix.lower()
    if ext not in {'.csv','.xlsx'}: raise HTTPException(400,'Only CSV and XLSX files are supported')
    aid=str(uuid.uuid4()); safe=f'{aid}{ext}'; dest=UPLOAD/safe
    with dest.open('wb') as f: shutil.copyfileobj(file.file,f)
    ANALYSES[aid]={'id':aid,'filename':file.filename,'dataset_path':str(dest),'status':'uploaded','timeline':['Uploading']}
    return ANALYSES[aid]
@app.post('/analyze')
async def analyze(payload:dict):
    aid=payload.get('analysis_id'); rec=ANALYSES.get(aid)
    if not rec: raise HTTPException(404,'Analysis not found')
    async with httpx.AsyncClient(timeout=120) as c:
        rec['timeline']+=['Profiling']; profile=await post_json(c,'profile',{'dataset_path':rec['dataset_path']})
        rec['timeline']+=['Planning']; plan=sanitize_cleaning_plan(await post_json(c,'plan',{'profile':profile}))
        rec['timeline']+=['Cleaning']; clean_path=str(UPLOAD/f'{aid}_clean.csv'); clean=await post_json(c,'clean',{'dataset_path':rec['dataset_path'],'output_path':clean_path,'actions':plan.get('cleaning_plan',[])})
        rec['timeline']+=['Visualizing']; charts=public_chart_urls(aid,(await post_json(c,'viz',{'dataset_path':clean_path,'analysis_id':aid}))['charts'])
        rec['timeline']+=['Generating Report']; ml=await post_json(c,'ml',{'profile':profile,'target_column':payload.get('target_column')})
        rep=await post_json(c,'report',{'analysis_id':aid,'profile':profile,'plan':plan,'charts':charts,'ml':ml})
    rec.update(status='complete',profile=profile,plan=plan,cleaning=clean,charts=charts,ml=ml,report=rep); rec['timeline'].append('Complete'); return rec
@app.get('/analysis/{aid}')
def get_analysis(aid:str):
    if aid not in ANALYSES: raise HTTPException(404,'Analysis not found')
    return ANALYSES[aid]
@app.get('/report/{aid}')
def get_report(aid:str):
    path=ANALYSES.get(aid,{}).get('report',{}).get('html_path')
    if not path: raise HTTPException(404,'Report not found')
    return FileResponse(path, media_type='text/html')
@app.get('/chart/{aid}/{filename}')
def get_chart(aid:str, filename:str):
    if aid not in ANALYSES: raise HTTPException(404,'Analysis not found')
    path=REPORT/aid/'charts'/Path(filename).name
    if not path.exists(): raise HTTPException(404,'Chart not found')
    return FileResponse(path)
@app.get('/download/{aid}')
def download(aid:str):
    path=ANALYSES.get(aid,{}).get('cleaning',{}).get('clean_path')
    if not path: raise HTTPException(404,'Clean dataset not found')
    return FileResponse(path, filename='clean_dataset.csv')
