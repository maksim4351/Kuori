document.addEventListener('DOMContentLoaded', function () {
    // Инициализация EmailJS
    emailjs.init("R0rQ4NOCaFuzVaOMq");

    const form = document.getElementById('equipmentForm');
    const signaturePad = document.getElementById('signaturePad');
    const ctx = signaturePad.getContext('2d');
    let drawing = false;

    signaturePad.addEventListener('mousedown', startDrawing);
    signaturePad.addEventListener('mouseup', stopDrawing);
    signaturePad.addEventListener('mousemove', draw);
    document.getElementById('clearSignature').addEventListener('click', clearSignature);

    function startDrawing(e) {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }

    function stopDrawing() {
        drawing = false;
    }

    function draw(e) {
        if (!drawing) return;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }

    function clearSignature() {
        ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
    }

    // Функция для добавления изображений в PDF
    function addImageToPDF(pdf, fileInputId, x, y, width, height, label) {
        const fileInput = document.getElementById(fileInputId);
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const imgData = event.target.result;
                pdf.text(label, x, y - 5);
                pdf.addImage(imgData, 'JPEG', x, y, width, height);
            };
            reader.readAsDataURL(file);
        } else {
            pdf.text(`${label}: (нет данных)`, x, y);
        }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const pdf = new jsPDF();

        pdf.text('Отчет об обслуживании оборудования', 10, 10);
        pdf.text(`Имя сотрудника: ${formData.get('employeeName') || '(не заполнено)'}`, 10, 20);
        pdf.text(`Выявленные проблемы: ${formData.get('problems') || '(не заполнено)'}`, 10, 30);
        pdf.text(`Проделанная работа: ${formData.get('workDone') || '(не заполнено)'}`, 10, 40);

        // Добавляем фотографии
        addImageToPDF(pdf, 'photo1', 10, 50, 60, 40, 'Фото первой стороны экрана');
        addImageToPDF(pdf, 'photo2', 80, 50, 60, 40, 'Фото второй стороны экрана');
        addImageToPDF(pdf, 'serialNumber', 150, 50, 60, 40, 'Фото серийного номера');
        addImageToPDF(pdf, 'photoBox', 10, 100, 60, 40, 'Фото электронного бокса');
        addImageToPDF(pdf, 'photoAndroid', 80, 100, 60, 40, 'Фото Android устройства');
        addImageToPDF(pdf, 'photoSMB', 150, 100, 60, 40, 'Фото SMB');
        addImageToPDF(pdf, 'photoVideoCard1', 10, 150, 60, 40, 'Фото видеокарты (первая сторона)');
        addImageToPDF(pdf, 'photoVideoCard2', 80, 150, 60, 40, 'Фото видеокарты (вторая сторона)');

        // Подпись
        const signatureImage = signaturePad.toDataURL('image/png');
        pdf.text('Подпись:', 10, 200);
        pdf.addImage(signatureImage, 'PNG', 10, 210, 80, 40);

        // Добавляем дату и время
        const timestamp = new Date().toLocaleString();
        pdf.text(`Дата и время: ${timestamp}`, 10, 260);

        // Конвертируем PDF в Blob
        const pdfBlob = pdf.output('blob');

        // Настройка параметров для EmailJS
        const emailParams = {
            to_email: formData.get('email'),
            employeeName: formData.get('employeeName') || '(не заполнено)',
            problems: formData.get('problems') || '(не заполнено)',
            workDone: formData.get('workDone') || '(не заполнено)',
            timestamp: timestamp
        };

        // Отправка письма через EmailJS
        emailjs.send("service_o7cgi6p", "template_tqcohom", emailParams, "R0rQ4NOCaFuzVaOMq")
        .then(function(response) {
            console.log("SUCCESS!", response.status, response.text);
            document.getElementById('notification').classList.remove('hidden');
        }, function(error) {
            console.error("Error sending email: ", error);
            alert("Не удалось отправить письмо. Проверьте консоль для деталей.");
        });
    });
});
