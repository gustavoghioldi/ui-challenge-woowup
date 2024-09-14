document.getElementById('emailForm').addEventListener('submit', handleEmailFormSubmit);

async function handleEmailFormSubmit(event) {
    event.preventDefault();

    const formData = getFormData();
    const responseDiv = document.getElementById('response');
    if (responseDiv) {
        responseDiv.innerHTML = 'Enviando...';
    }

    try {
        const result = await sendEmail(formData);
        if (responseDiv) {
            responseDiv.innerHTML = `Correo enviado usando: ${result.message}`;
        }
    } catch (error) {
        if (responseDiv) {
            responseDiv.innerHTML = `Error: ${error.message}`;
        }
    }
}

function getFormData() {
    return {
        subject: document.getElementById('subject').value,
        body: document.getElementById('body').value,
        from_email: document.getElementById('from_email').value,
        to_emails: document.getElementById('to_emails').value.split(','),
        baseUrl: document.getElementById('baseUrl').value
    };
}

async function sendEmail(formData) {
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${formData.baseUrl}/api/send-email/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            subject: formData.subject,
            message: formData.body,
            from_email: formData.from_email,
            recipient_list: formData.to_emails
        })
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'Error en la solicitud');
    }

    return result;
}

async function auth(username, password, baseUrl) {
    const response = await fetch(`${baseUrl}/api/token/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        throw new Error('Error en la solicitud');
    }

    const data = await response.json();
    return data.access;
}

async function loginAndSaveToken() {
    const baseUrl = document.getElementById('baseUrl').value;

    if (!baseUrl) {
        alert('El campo Base URL está vacío. Por favor, ingrese una URL válida.');
        return;
    }

    const username = prompt("Por favor, ingrese su nombre de usuario:");
    const password = prompt("Por favor, ingrese su contraseña:");

    if (username && password) {
        try {
            const token = await auth(username, password, baseUrl);
            localStorage.setItem('jwt', token);
            const responseDiv = document.getElementById('response');
            if (responseDiv) {
                responseDiv.innerHTML = 'Autenticación exitosa. Token guardado.';
            }
            document.getElementById('emailInputs').style.display = 'block';
            document.getElementById('baseUrl').disabled = true;
            document.getElementById('setCredentialsButton').style.display = 'none';
        } catch (error) {
            const responseDiv = document.getElementById('response');
            if (responseDiv) {
                responseDiv.innerHTML = `Error al iniciar sesión: ${error.message}`;
            }
        }
    } else {
        const responseDiv = document.getElementById('response');
        if (responseDiv) {
            responseDiv.innerHTML = 'Nombre de usuario y contraseña son requeridos.';
        }
    }
}
