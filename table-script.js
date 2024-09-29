document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#deviceTable tbody");
    const addDeviceBtn = document.getElementById("addDeviceBtn");
    let devices = [];

    // Загружаем устройства из файла при старте
    loadDeviceListFromFile();

    // Обработчик добавления нового устройства
    addDeviceBtn.addEventListener("click", () => {
        const newDevice = {
            serialNumber: document.getElementById("serialNumber").value || "N/A",
            androidSerial: document.getElementById("androidSerial").value || "N/A",
            address: document.getElementById("address").value || "N/A",
            coordinates: document.getElementById("coordinates").value || "N/A",
            spare1: document.getElementById("spare1").value || "N/A",
            spare2: document.getElementById("spare2").value || "N/A"
        };

        devices.push(newDevice);
        sortDevices();
        renderTable();
        document.getElementById("addDeviceForm").reset();
        saveDeviceListToFile();
    });

    // Обработчик для удаления строк
    tableBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            deleteTarget = event.target.closest("tr").getAttribute('data-id');
            document.getElementById("confirmDeleteModal").style.display = "block";
        }
    });

    // Показ модального окна при удалении
    let deleteTarget = null;
    document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
        if (deleteTarget !== null) {
            devices = devices.filter((_, index) => index.toString() !== deleteTarget);
            deleteTarget = null;
            renderTable();
            saveDeviceListToFile();
            document.getElementById("confirmDeleteModal").style.display = "none";
        }
    });

    document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
        document.getElementById("confirmDeleteModal").style.display = "none";
    });

    // Переключение режима редактирования при нажатии кнопки Edit
    tableBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("edit-btn")) {
            const row = event.target.closest("tr").children;
            for (let i = 0; i < row.length - 1; i++) {
                const cell = row[i];
                cell.contentEditable = cell.contentEditable === "false" ? "true" : "false";

                // Если редактирование включено, добавляем класс "editing-cell"
                if (cell.contentEditable === "true") {
                    cell.classList.add("editing-cell");
                } else {
                    cell.classList.remove("editing-cell");
                }
            }
            saveDeviceListToFile();
        }
    });

    // Сортировка устройств по серийному номеру
    function sortDevices() {
        devices.sort((a, b) => (a.serialNumber > b.serialNumber ? 1 : -1));
    }

    // Отображение таблицы на основе списка устройств
    function renderTable() {
        tableBody.innerHTML = "";
        devices.forEach((device, index) => {
            const row = document.createElement("tr");
            row.setAttribute('data-id', index);
            row.innerHTML = `
                <td contenteditable="false">${device.serialNumber}</td>
                <td contenteditable="false">${device.androidSerial}</td>
                <td contenteditable="false">${device.address}</td>
                <td contenteditable="false">${device.coordinates}</td>
                <td contenteditable="false">${device.spare1}</td>
                <td contenteditable="false">${device.spare2}</td>
                <td>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </td>`;
            tableBody.appendChild(row);
        });
    }

    // Сохранение списка устройств в JSON файл
    function saveDeviceListToFile() {
        const deviceList = JSON.stringify(devices, null, 2);
        const blob = new Blob([deviceList], { type: 'application/json' });
        saveAs(blob, 'device_list.json');
    }

    // Загрузка списка устройств из файла JSON
    function loadDeviceListFromFile() {
        fetch('device_list.json')
            .then(response => response.json())
            .then(data => {
                devices = data;
                sortDevices();
                renderTable();
            })
            .catch(error => console.error("Error loading device list:", error));
    }
});
