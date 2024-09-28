document.addEventListener("DOMContentLoaded", () => { 
    const { jsPDF } = window.jspdf;

    const signaturePad = document.getElementById("signaturePad");
    const clearButton = document.getElementById("clearSignature");
    const savePdfBtn = document.getElementById("savePdfBtn");
    const context = signaturePad.getContext("2d");
    let drawing = false;

    // Нумерация документов сохраняется в localStorage
    let documentNumber = parseInt(localStorage.getItem('documentNumber')) || 1;

    const imageInputs = [
        document.getElementById("screenPhoto1"),
        document.getElementById("screenPhoto2"),
        document.getElementById("serialNumberPhoto"),
        document.getElementById("electronicBoxPhoto"),
        document.getElementById("androidPhoto"),
        document.getElementById("smbPhoto"),
        document.getElementById("videoCard1Photo"),
        document.getElementById("videoCard2Photo"),
    ];

    const horizontalQuestions = [2, 3, 4, 5, 6, 7];

    // Обработка кнопки Take Photo и добавление capture
    imageInputs.forEach((input, index) => {
        if (horizontalQuestions.includes(index)) {
            input.addEventListener("change", () => validateImageOrientation(input, index));
        }
        // Добавляем атрибут capture для камер на телефоне
        input.setAttribute("accept", "image/*");
        input.setAttribute("capture", "camera");
    });

    function validateImageOrientation(input, index) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    if (aspectRatio < 1) {
                        alert(`Only horizontal images are allowed for question ${index + 3}. Please upload a horizontal photo.`);
                        input.value = "";
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    signaturePad.addEventListener("mousedown", startDrawing);
    signaturePad.addEventListener("mouseup", stopDrawing);
    signaturePad.addEventListener("mousemove", draw);
    signaturePad.addEventListener("touchstart", startDrawing);
    signaturePad.addEventListener("touchend", stopDrawing);
    signaturePad.addEventListener("touchmove", draw);

    function startDrawing(event) {
        drawing = true;
        context.beginPath();
        context.moveTo(getX(event), getY(event));
        event.preventDefault();
    }

    function stopDrawing() {
        drawing = false;
    }

    function draw(event) {
        if (!drawing) return;
        context.lineTo(getX(event), getY(event));
        context.stroke();
        event.preventDefault();
    }

    function getX(event) {
        return event.type.includes("touch")
            ? event.touches[0].clientX - signaturePad.getBoundingClientRect().left
            : event.clientX - signaturePad.getBoundingClientRect().left;
    }

    function getY(event) {
        return event.type.includes("touch")
            ? event.touches[0].clientY - signaturePad.getBoundingClientRect().top
            : event.clientY - signaturePad.getBoundingClientRect().top;
    }

    clearButton.addEventListener("click", () => {
        context.clearRect(0, 0, signaturePad.width, signaturePad.height);
    });

    savePdfBtn.addEventListener("click", async () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Получение текущей даты и времени
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
        const formattedTime = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

        // Заголовок документа
        const documentHeader = `Outshine 55\nNo.: ${String(documentNumber).padStart(3, '0')} Date: ${formattedDate} Time: ${formattedTime}`;
        const fileName = `Outshine_55_Report_No${String(documentNumber).padStart(3, '0')}_${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}_${String(currentDate.getHours()).padStart(2, '0')}-${String(currentDate.getMinutes()).padStart(2, '0')}.pdf`;

        documentNumber += 1;
        localStorage.setItem('documentNumber', documentNumber.toString());

        // Заголовок
        doc.setFontSize(14);
        doc.text(documentHeader, 10, 10);

        // Двойная линия под шапкой
        const lineYOffset = 20;
        doc.setLineWidth(0.5);
        doc.line(10, lineYOffset, pageWidth - 10, lineYOffset);
        doc.setLineWidth(0.5);
        doc.line(10, lineYOffset + 2, pageWidth - 10, lineYOffset + 2);

        let yOffset = lineYOffset + 10;

        const questions = [
            "1. Photo of the first side of the screen before servicing",
            "2. Photo of the second side of the screen before servicing",
            "3. Photo of the device serial number (must include an asterisk)",
            "4. Photo of the electronic box",
            "5. Photo of the Android system",
            "6. Photo of the SMB",
            "7. Photo of the first side of the video card",
            "8. Photo of the second side of the video card",
            "9. Detected issues",
            "10. Work performed",
            "11. Employee name",
            "12. Signature"
        ];

        const answers = [
            document.getElementById("detectedIssues").value,
            document.getElementById("workDone").value,
            document.getElementById("employeeName").value
        ];

        for (let i = 0; i < questions.length; i++) {
            if (yOffset > pageHeight - 30) {
                doc.addPage();
                yOffset = 20;
            }

            doc.setFontSize(12);
            doc.text(questions[i], 10, yOffset);
            yOffset += 10;

            if (i < 8) {
                const fileInput = getFileInputByIndex(i);
                if (fileInput && fileInput.files.length > 0) {
                    const imageData = await getBase64(fileInput.files[0]);
                    const { width, height } = await getImageDimensions(imageData);

                    let displayWidth, displayHeight;
                    const aspectRatio = width / height;

                    if (aspectRatio > 1) {
                        displayWidth = pageWidth - 20;
                        displayHeight = displayWidth / aspectRatio;
                    } else {
                        displayHeight = 100;
                        displayWidth = displayHeight * aspectRatio;
                    }

                    if (yOffset + displayHeight > pageHeight - 30) {
                        doc.addPage();
                        yOffset = 20;
                    }

                    const centeredX = (pageWidth - displayWidth) / 2;
                    doc.addImage(imageData, "JPEG", centeredX, yOffset, displayWidth, displayHeight);
                    yOffset += displayHeight + 5;
                }
            }

            if (i >= 8 && i <= 10) {
                doc.text(answers[i - 8], 10, yOffset);
                yOffset += 10;
            }

            if (i === 11) {
                const signatureImage = signaturePad.toDataURL("image/png");
                if (yOffset + 60 > pageHeight - 30) {
                    doc.addPage();
                    yOffset = 20;
                }
                doc.addImage(signatureImage, "PNG", 20, yOffset, 170, 60);
                yOffset += 70;
            }

            doc.line(10, yOffset, pageWidth - 10, yOffset);
            yOffset += 10;
        }

        // Дублируем шапку в конце документа
        yOffset += 20;
        doc.setFontSize(14);
        doc.text(documentHeader, 10, yOffset);
        yOffset += 10;
        doc.line(10, yOffset, pageWidth - 10, yOffset);
        yOffset += 10;

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2 - 20, pageHeight - 10);
        }

        const blob = doc.output("blob");
        saveAs(blob, fileName);
    });

    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function getFileInputByIndex(index) {
        switch (index) {
            case 0: return document.getElementById("screenPhoto1");
            case 1: return document.getElementById("screenPhoto2");
            case 2: return document.getElementById("serialNumberPhoto");
            case 3: return document.getElementById("electronicBoxPhoto");
            case 4: return document.getElementById("androidPhoto");
            case 5: return document.getElementById("smbPhoto");
            case 6: return document.getElementById("videoCard1Photo");
            case 7: return document.getElementById("videoCard2Photo");
            default: return null;
        }
    }

    function getImageDimensions(imageData) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.src = imageData;
        });
    }
});
