document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#deviceTable tbody");
    const addDeviceBtn = document.getElementById("addDeviceBtn");
    const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbwKYePleoevwM0YtX0TcsovhZgceleh0OC7C-8j46LR9MQ2a75pvGmoVF7_eV-6YOnY-w/exec";
    let devices = [];

    loadDeviceListFromAPI();

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
        saveDeviceToAPI(newDevice);
    });

    tableBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const deleteIndex = event.target.closest("tr").getAttribute('data-id');
            const deleteDevice = devices[deleteIndex];
            devices.splice(deleteIndex, 1);
            renderTable();
            deleteDeviceFromAPI(deleteDevice);
        }

        if (event.target.classList.contains("edit-btn")) {
            const row = event.target.closest("tr").children;
            for (let i = 0; i < row.length - 1; i++) {
                const cell = row[i];
                cell.contentEditable = cell.contentEditable === "false" ? "true" : "false";

                if (cell.contentEditable === "true") {
                    cell.classList.add("editing-cell");
                } else {
                    cell.classList.remove("editing-cell");
                }
            }
            updateDeviceInAPI(event.target.closest("tr"));
        }
    });

    function sortDevices() {
        devices.sort((a, b) => (a.serialNumber > b.serialNumber ? 1 : -1));
    }

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

    function saveDeviceToAPI(device) {
        fetch(GOOGLE_SHEETS_API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "add", device }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Device saved:", data);
        })
        .catch(error => {
            console.error("Error saving device:", error);
        });
    }

    function updateDeviceInAPI(row) {
        const index = row.getAttribute('data-id');
        const updatedDevice = {
            serialNumber: row.children[0].textContent,
            androidSerial: row.children[1].textContent,
            address: row.children[2].textContent,
            coordinates: row.children[3].textContent,
            spare1: row.children[4].textContent,
            spare2: row.children[5].textContent
        };

        fetch(GOOGLE_SHEETS_API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "update", index, device: updatedDevice }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Device updated:", data);
        })
        .catch(error => {
            console.error("Error updating device:", error);
        });
    }

    function deleteDeviceFromAPI(device) {
        fetch(GOOGLE_SHEETS_API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "delete", serialNumber: device.serialNumber }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Device deleted:", data);
        })
        .catch(error => {
            console.error("Error deleting device:", error);
        });
    }

    function loadDeviceListFromAPI() {
        fetch(GOOGLE_SHEETS_API_URL + "?action=read")
            .then(response => response.json())
            .then(data => {
                devices = data.map(row => ({
                    serialNumber: row[0],
                    androidSerial: row[1],
                    address: row[2],
                    coordinates: row[3],
                    spare1: row[4],
                    spare2: row[5]
                }));
                sortDevices();
                renderTable();
            })
            .catch(error => {
                console.error("Error loading device list:", error);
            });
    }
});
