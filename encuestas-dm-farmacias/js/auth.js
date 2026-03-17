const $auth = (sel) => document.querySelector(sel);

function showScreen(id) {
  ["welcomeScreen", "loginScreen", "verifyScreen", "alreadyAnsweredScreen", "surveyScreen"]
    .forEach((x) => {
      const el = document.getElementById(x);
      if (el) el.classList.add("hidden");
    });

  const target = document.getElementById(id);
  if (target) target.classList.remove("hidden");
}

async function hasAlreadyResponded(userId) {
  const { data, error } = await sb
    .from("form_responses")
    .select("id")
    .eq("form_slug", "dm-farmacias")
    .eq("user_id", userId)
    .limit(1);

  if (error) {
    console.error("hasAlreadyResponded error:", error);
    return false;
  }

  return Array.isArray(data) && data.length > 0;
}

async function continueAfterLogin() {
  const { data: { user }, error } = await sb.auth.getUser();

  if (error || !user) {
    showScreen("loginScreen");
    return;
  }

  if (await hasAlreadyResponded(user.id)) {
    showScreen("alreadyAnsweredScreen");
    return;
  }

  showScreen("verifyScreen");
}

document.addEventListener("DOMContentLoaded", async () => {
  $auth("#btnStart")?.addEventListener("click", () => {
    showScreen("loginScreen");
  });

  $auth("#btnBackToWelcome")?.addEventListener("click", () => {
    showScreen("welcomeScreen");
  });

  $auth("#btnBackToLogin")?.addEventListener("click", () => {
    showScreen("loginScreen");
  });

  $auth("#btnSendCode")?.addEventListener("click", async () => {
    const email = ($auth("#emailInput")?.value || "").trim().toLowerCase();

    if (!email) {
      alert("Ingrese un email válido.");
      return;
    }

    const { error } = await sb.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: "https://funnel-b2b.vercel.app/encuestas-dm-farmacias/index.html"
      }
    });

    if (error) {
      console.error("signInWithOtp error:", error);
      alert("No se pudo enviar el enlace.");
      return;
    }

    alert("Le enviamos un enlace de acceso a su casilla de email.");
  });

  $auth("#btnVerifyCode")?.addEventListener("click", async () => {
    const pharmacyName = ($auth("#pharmacyNameInput")?.value || "").trim();
    const respondentName = ($auth("#respondentNameInput")?.value || "").trim();

    if (!pharmacyName) {
      alert("Ingrese el nombre de la farmacia.");
      return;
    }

    if (!respondentName) {
      alert("Ingrese su nombre.");
      return;
    }

    if (window.state) {
      window.state.pharmacyName = pharmacyName;
      window.state.respondentName = respondentName;
    }

    showScreen("surveyScreen");

    if (typeof window.initSurvey === "function") {
      window.initSurvey();
    }
  });

  const { data: { session } } = await sb.auth.getSession();

  if (session?.user) {
    await continueAfterLogin();
  } else {
    showScreen("welcomeScreen");
  }
});
