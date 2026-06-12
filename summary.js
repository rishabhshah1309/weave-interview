export default async function handler(req, res){
  if(req.method!=="POST"){return res.status(405).json({error:"POST only"});}
  const key=process.env.ANTHROPIC_API_KEY;
  let e=req.body; if(typeof e==="string"){try{e=JSON.parse(e);}catch(_){e={};}}
  if(!e||!e.name){return res.status(200).json({live:false});}
  if(!key){return res.status(200).json({live:false,reason:"no_key"});}
  const m=e.metrics||{}, sc=e.scores||{};
  const isLev = e.mode==="leverage";
  const fp=(e.footprint||[]).map(function(x){return x[0]+" "+x[1];}).join(", ")||"none dominant";
  const prompt = isLev ?
`You are an engineering manager explaining ONE engineer's organizational leverage to a busy eng leader at PostHog, in 2-3 sentences.
Engineer: ${e.name} (${e.role}). Over 90 days on posthog/posthog.
Product-surface footprint (merged PRs touching each surface, by title): ${fp}.
Leverage signals: ${m.reviews} reviews given on teammates' PRs (#${m.reviewRank} of ${m.cohort} reviewers), ${m.maint} maintenance/refactor PRs others build on, ${m.feat} features, ${m.fix} fixes.
Explain WHERE their work concentrates and HOW their reviews + shared-surface work multiply impact across the team. Use ONLY these numbers; invent nothing. Direct, no bullet points.` :
`You are a pragmatic engineering manager writing a short readout for a busy eng leader at PostHog.
Engineer: ${e.name} (@${e.handle}), area: ${e.role}.
Window: trailing 90 days on posthog/posthog. QUILL impact score ${e.quill}/100 (team average = 50). Rank #${e.rank} of ${m.cohort}, ${e.percentile}.
Driver scores (50 = team avg): Quality ${sc.Quality}, Users ${sc.Users}, Impact ${sc.Impact}, Leverage ${sc.Leverage}, Leadership ${sc.Leadership}.
Real GitHub signals: ${m.merged} merged PRs (~${m.perDay}/day), ${m.feat} feature PRs (${m.featShare}% of work), ${m.fix} fix PRs (${m.fixShare}%), ${m.maint} maintenance PRs, ${m.reviews} reviews given on teammates PRs (${m.reviewRatio}x their own output, #${m.reviewRank} reviewer in cohort). 30-day momentum ${e.velocity>0?"+":""}${e.velocity}% vs their 90-day run-rate.
Write 3-4 sentences on WHY they rank here and their impact signature. Use ONLY the numbers above; do not invent incident rates, deploy stats, or any metric not given. Lead with the single biggest differentiator. Direct, no fluff, no bullet points.`;
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
      headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({model:process.env.ANTHROPIC_MODEL||"claude-haiku-4-5-20251001",max_tokens:400,messages:[{role:"user",content:prompt}]})});
    const j=await r.json();
    const text=j&&j.content&&j.content[0]&&j.content[0].text;
    if(!text){return res.status(200).json({live:false,reason:"no_text"});}
    return res.status(200).json({live:true,summary:text.trim()});
  }catch(err){return res.status(200).json({live:false,reason:String(err)});}
}
