// Retry only transient transport failures, never a missing or invalid asset.
export async function readAsset(url,format,timeout){
 for(let attempt=0;attempt<2;attempt++){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(timeout)});
   if(!response.ok)throw new Error('Asset HTTP '+response.status);
   return await response[format]();
  }catch(error){
   if(attempt===1||!['TimeoutError','AbortError','TypeError'].includes(error.name))throw error;
  }
 }
}
