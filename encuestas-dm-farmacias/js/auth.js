const $ = (sel)=>document.querySelector(sel);

$("#btnStart").onclick = ()=>{
  $("#welcomeScreen").style.display="none";
  $("#loginScreen").style.display="block";
};

$("#btnSendCode").onclick = async ()=>{

  const email=$("#emailInput").value.trim();

  if(!email) return;

  const {error}=await sb.auth.signInWithOtp({
    email
  });

  if(error){
    alert("Error enviando código");
    return;
  }

  $("#loginScreen").style.display="none";
  $("#verifyScreen").style.display="block";

};

$("#btnVerifyCode").onclick = async ()=>{

  const email=$("#emailInput").value.trim();
  const token=$("#otpInput").value.trim();

  const {error}=await sb.auth.verifyOtp({
    email,
    token,
    type:"email"
  });

  if(error){
    alert("Código incorrecto");
    return;
  }

  checkExistingResponse();

};

async function checkExistingResponse(){

  const {data:{user}}=await sb.auth.getUser();

  const {data}=await sb
    .from("form_responses")
    .select("id")
    .eq("user_id",user.id)
    .eq("form_slug","encuesta_dm_farmacias");

  if(data && data.length>0){

    alert("Ya registramos tu respuesta.");

    return;

  }

  $("#verifyScreen").style.display="none";
  $("#surveyScreen").style.display="block";

  initSurvey();

}
