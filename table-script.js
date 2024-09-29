document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#deviceTable tbody");
    const addDeviceBtn = document.getElementById("addDeviceBtn");
    let devices = [];

    // Загружаем устройства из localStorage или файла при старте
    loadDeviceListFromStorage();

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
        saveDeviceListToStorage();
    });

    // Обработчик для удаления строк
    tableBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const deleteIndex = event.target.closest("tr").getAttribute('data-id');
            devices.splice(deleteIndex, 1); // Удаляем элемент из массива
            renderTable();
            saveDeviceListToStorage();
        }
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
            saveDeviceListToStorage();
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

    // Сохранение списка устройств в localStorage
    function saveDeviceListToStorage() {
        localStorage.setItem('deviceList', JSON.stringify(devices));
    }

    // Загрузка списка устройств из localStorage или из JSON-файла
    function loadDeviceListFromStorage() {
        // Загружаем из localStorage, если данные есть
        const savedDevices = localStorage.getItem('deviceList');
        if (savedDevices) {
            devices = JSON.parse(savedDevices);
            sortDevices();
            renderTable();
        } else {
            // Если данных в localStorage нет, загружаем из файла JSON
            fetch('device_list.json')
                .then(response => response.json())
                .then(data => {
                    devices = data;
                    sortDevices();
                    renderTable();
                    saveDeviceListToStorage(); // Сохраняем в localStorage для последующих сеансов
                })
                .catch(error => console.error("Error loading device list:", error));
        }
    }
});
