function haveCommonElement(a, b) {
	for (let elt of a) {
		if (b.includes(elt)) return true;
	}
	return false;
}
async function* yield_confirm(old_msg,confirmed,n_confirmed){
			while(true){
			  let new_msg=yield
			  if(["yes","y","absolutely","ja"].includes(new_msg.content.toLowerCase())){
			  if(new_msg.author.id==old_msg.author.id){
			    return await confirmed()
			  }}else if(["no","n","nein","absolutely not"].includes(new_msg.content.toLowerCase())){
			     if(new_msg.author.id==old_msg.author.id){
			    return await n_confirmed()
			       
			     }
			     }else{
			        if(new_msg.author.id==old_msg.author.id){
			          n_msg.channel.send("please respond using Y/N")
			        }
			     }
			  
			}
}
module.exports = { haveCommonElement ,yield_confirm};
