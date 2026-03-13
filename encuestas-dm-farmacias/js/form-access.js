async function validateAccessCode() {
  const params = new URLSearchParams(window.location.search);
  const accessCode = params.get("code");

  if (!accessCode) {
    return {
      ok: false,
      message: "Falta el código de acceso en la URL."
    };
  }

  const { data, error } = await sb.rpc("validate_form_access_code", {
    p_code: accessCode
  });

  if (error) {
    console.error("validateAccessCode error:", error);
    return {
      ok: false,
      message: "No se pudo validar el código."
    };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      message: "Código inválido."
    };
  }

  const row = data[0];

  if (!row.is_valid) {
    return {
      ok: false,
      message: "Código deshabilitado."
    };
  }

  if (row.already_responded) {
    return {
      ok: false,
      message: "Esta farmacia ya respondió la encuesta."
    };
  }

  return {
    ok: true,
    accessCode,
    recipientId: row.recipient_id,
    formId: row.form_id,
    pharmacyName: row.pharmacy_name
  };
}
