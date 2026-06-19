
// Se ejecuta cuando el DOM está completamente cargado (evento de jQuery)
$(document).ready(function () {

  /*1. TIPOS DE DATOS Y VARIABLES*/

  // Cadena (string): credenciales válidas registradas en el sistema
  const USUARIO_VALIDO = "admin";
  const PASSWORD_VALIDA = "Aitec2025";

  // Numérico (number): control de intentos
  let intentosFallidos = 0;
  const MAX_INTENTOS = 3;

  // Booleano (boolean): estado de sesión
  let sesionActiva = false;

  // Arreglo (array): historial de intentos de acceso (objetos con cadena + booleano)
  let historialIntentos = [];

  /*2. FUNCIONES DE VALIDACIÓN (funciones declaradas)*/

  // Función declarada: valida que el campo no esté vacío
  function campoVacio(valor) {
    // Estructura de control condicional
    return valor.trim() === "";
  }

  // Función declarada con argumentos y valor de retorno booleano
  function validarUsuario(usuario) {
    if (campoVacio(usuario)) {
      return { valido: false, mensaje: "El usuario es obligatorio." };
    }
    if (usuario.length < 3) {
      return { valido: false, mensaje: "El usuario debe tener al menos 3 caracteres." };
    }
    return { valido: true, mensaje: "" };
  }

  // Función declarada para validar contraseña con estructura de control
  function validarPassword(password) {
    if (campoVacio(password)) {
      return { valido: false, mensaje: "La contraseña es obligatoria." };
    }
    if (password.length < 6) {
      return { valido: false, mensaje: "La contraseña debe tener mínimo 6 caracteres." };
    }
    return { valido: true, mensaje: "" };
  }

  /* =========================================================
     3. FUNCIÓN POR EXPRESIÓN (de cálculo)
  ========================================================= */

  // Función por expresión: calcula los intentos restantes (operación numérica)
  const calcularIntentosRestantes = function (maxIntentos, intentosUsados) {
    return maxIntentos - intentosUsados;
  };

  // Función flecha (función por expresión anónima): formatea la hora actual
  const obtenerHoraActual = () => {
    const ahora = new Date();
    // Ciclo for simple para construir el formato HH:MM:SS con ceros a la izquierda
    const partes = [ahora.getHours(), ahora.getMinutes(), ahora.getSeconds()];
    let resultado = "";
    for (let i = 0; i < partes.length; i++) {
      let parte = partes[i].toString();
      if (parte.length < 2) {
        parte = "0" + parte;
      }
      resultado += (i === 0 ? "" : ":") + parte;
    }
    return resultado;
  };

  /* =========================================================
     4. FUNCIONES DE ACCESO AL DOM (jQuery)
  ========================================================= */

  // Función declarada que llama a otras funciones (muestra errores en el DOM)
  function mostrarError(idCampo, mensaje) {
    $("#error-" + idCampo).text(mensaje);
    $("#" + idCampo).addClass("input-error");
  }

  function limpiarErrores() {
    $(".error-msg").text("");
    $("input").removeClass("input-error");
    $("#alert-box").hide().removeClass("alert--error alert--success");
  }

  // Función anónima asignada a variable: muestra una alerta genérica
  const mostrarAlerta = function (mensaje, tipo) {
    $("#alert-box")
      .text(mensaje)
      .removeClass("alert--error alert--success")
      .addClass(tipo === "error" ? "alert--error" : "alert--success")
      .show();
  };

  // Actualiza el texto de intentos restantes (llama a calcularIntentosRestantes)
  function actualizarInfoIntentos() {
    const restantes = calcularIntentosRestantes(MAX_INTENTOS, intentosFallidos);
    if (intentosFallidos > 0 && restantes > 0) {
      $("#attempts-info").text(`Intentos restantes: ${restantes}`);
    } else {
      $("#attempts-info").text("");
    }
  }

  /* =========================================================
     5. LÓGICA DE BLOQUEO (estructura de control + ciclo)
  ========================================================= */

  function bloquearAcceso() {
    $("#login-section").hide();
    $("#blocked-section").show();

    let segundos = 15; // dato numérico
    $("#countdown").text(segundos);

    // Ciclo controlado por intervalo (estructura de control con condicional interno)
    const temporizador = setInterval(function () {
      segundos--;
      $("#countdown").text(segundos);

      if (segundos <= 0) {
        clearInterval(temporizador);
        intentosFallidos = 0; // reinicia el contador
        $("#blocked-section").hide();
        $("#login-section").show();
        limpiarErrores();
        actualizarInfoIntentos();
      }
    }, 1000);
  }

  /* =========================================================
     6. FUNCIÓN PRINCIPAL: PROCESAR INICIO DE SESIÓN
     (llama a varias funciones: validarUsuario, validarPassword,
      mostrarError, mostrarAlerta, actualizarInfoIntentos)
  ========================================================= */
  function procesarLogin(usuario, password) {
    limpiarErrores();

    const resultadoUsuario = validarUsuario(usuario);
    const resultadoPassword = validarPassword(password);

    let formularioValido = true; // booleano de control

    // Estructuras de control condicionales para mostrar errores de formato
    if (!resultadoUsuario.valido) {
      mostrarError("username", resultadoUsuario.mensaje);
      formularioValido = false;
    }

    if (!resultadoPassword.valido) {
      mostrarError("password", resultadoPassword.mensaje);
      formularioValido = false;
    }

    // Si el formato no es válido, no se continúa con la verificación de credenciales
    if (!formularioValido) {
      return;
    }

    // Verificación de credenciales (comparación de cadenas)
    if (usuario === USUARIO_VALIDO && password === PASSWORD_VALIDA) {
      // Acceso concedido
      sesionActiva = true;
      historialIntentos.push({ usuario: usuario, exito: true });

      mostrarAlerta("Validando credenciales...", "success");

      $("#welcome-user").text(usuario);
      $("#login-time").text(obtenerHoraActual());
      $("#stat-attempts").text(intentosFallidos);
      $("#stat-status").text("Activa");

      // Pequeña transición antes de mostrar el panel (uso de setTimeout y función anónima)
      setTimeout(function () {
        $("#login-section").hide();
        $("#dashboard-section").fadeIn();
      }, 600);

    } else {
      // Acceso denegado: estructura de control + incremento de contador
      intentosFallidos++;
      historialIntentos.push({ usuario: usuario, exito: false });

      const restantes = calcularIntentosRestantes(MAX_INTENTOS, intentosFallidos);

      if (restantes <= 0) {
        mostrarAlerta("Demasiados intentos fallidos. Acceso bloqueado temporalmente.", "error");
        bloquearAcceso();
      } else {
        mostrarAlerta(`Usuario o contraseña incorrectos. Te quedan ${restantes} intento(s).`, "error");
      }

      actualizarInfoIntentos();
    }
  }

  /* =========================================================
     7. EVENTOS jQuery (captura de eventos del usuario)
  ========================================================= */

  // Evento submit del formulario (función anónima como manejador)
  $("#login-form").on("submit", function (evento) {
    evento.preventDefault(); // evita el envío real del formulario

    const usuario = $("#username").val();
    const password = $("#password").val();

    procesarLogin(usuario, password);
  });

  // Evento change: mostrar/ocultar contraseña (manipulación del DOM)
  $("#show-password").on("change", function () {
    const tipoCampo = $(this).is(":checked") ? "text" : "password";
    $("#password").attr("type", tipoCampo);
  });

  // Evento click: cerrar sesión (función anónima)
  $("#btn-logout").on("click", function () {
    sesionActiva = false;
    intentosFallidos = 0;

    $("#dashboard-section").hide();
    $("#login-section").fadeIn();
    $("#login-form")[0].reset();
    limpiarErrores();
    actualizarInfoIntentos();
  });

  // Evento input: limpia el mensaje de error mientras el usuario escribe
  $("#username, #password").on("input", function () {
    const idCampo = $(this).attr("id");
    $("#error-" + idCampo).text("");
    $(this).removeClass("input-error");
  });

  /* =========================================================
     8. INICIALIZACIÓN
  ========================================================= */
  actualizarInfoIntentos();

});
