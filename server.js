// Run: ANTHROPIC_API_KEY=your_key node server.js   (Node 18+, no npm packages needed)
const http=require('http'),fs=require('fs'),path=require('path');
const KEY=process.env.ANTHROPIC_API_KEY,MODEL=process.env.CLAUDE_MODEL||'claude-sonnet-5-5';
const SYSTEM=`You are Chalo AI, the friendly assistant of Chalo Rides, a cab/auto/bike ride app in India.
Ride types: Glide (bike), Zip (auto), Cruise (hatchback), Sky Premier (sedan), Squad XL (6-seat SUV).
Known places: Airport, Central Station, City Mall, Beach Road, Tech Park, Old Town, University.
Be warm, short, use light Hinglish. Never invent prices; only quote numbers found in the live app context. When asked to recommend, weigh distance, price, ETA and group size, set pick to the ride name and justify in one short line.
Reply ONLY with JSON: {"reply":"text","from":"","to":"","time":"HH:MM 24h or empty","date":"YYYY-MM-DD or empty","search":true|false,"pick":"ride name or empty"}.
Set search true only when the user clearly wants to see prices for a trip. Leave unknown fields empty.`;
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript'};
http.createServer(async(req,res)=>{
  if(req.method==='POST'&&req.url==='/api/chat'){
    let b='';for await(const c of req)b+=c;
    try{
      if(!KEY)throw new Error('Set ANTHROPIC_API_KEY');
      const {messages,context}=JSON.parse(b);
      const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
        headers:{'content-type':'application/json','x-api-key':KEY,'anthropic-version':'2023-06-01'},
        body:JSON.stringify({model:MODEL,max_tokens:400,system:SYSTEM+' Today is '+new Date().toDateString()+'.'+(context?' Live app context: '+JSON.stringify(context):''),messages:messages.slice(-10)})});
      const j=await r.json();let t=(j.content&&j.content[0]&&j.content[0].text)||'{}';
      t=t.replace(/```json|```/g,'').trim();let out;try{out=JSON.parse(t)}catch{out={reply:t}}
      res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(out));
    }catch(e){res.writeHead(500);res.end(JSON.stringify({error:e.message}))}
    return}
  const f=path.join(__dirname,req.url==='/'?'index.html':req.url.split('?')[0]);
  if(!f.startsWith(__dirname)||!fs.existsSync(f)){res.writeHead(404);return res.end('Not found')}
  res.writeHead(200,{'content-type':types[path.extname(f)]||'text/plain'});fs.createReadStream(f).pipe(res);
}).listen(3000,()=>console.log('Chalo Rides running at http://localhost:3000'));
