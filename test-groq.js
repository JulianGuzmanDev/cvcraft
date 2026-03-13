const { groq } = require('./lib/groq');
(async()=>{\n  try{\n    const r=await groq.chat.completions.create({model:'nomic-embed-text-v1_5',messages:[{role:'user',content:'test'}]});\n    console.log(JSON.stringify(r,null,2));\n  } catch(e){ console.error(e); }\n})();
