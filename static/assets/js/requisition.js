// Add a new line item
let lineItemIndex = 1;
document.getElementById("add-item").addEventListener("click", function () {
    const lineItemsContainer = document.getElementById("line-items");
    const newItem = document.createElement("div");
    newItem.classList.add("line-item", "row", "mb-3");
    newItem.innerHTML = `
                        <div class="col-md-3">
                            <div class="form-group">
                                <label for="item_name">Item Name</label>
                                <input type="text" class="form-control" name="line_items[${lineItemIndex}][item_name]" required>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="form-group">
                                <label for="quantity">Quantity</label>
                                <input type="number" class="form-control" name="line_items[${lineItemIndex}][quantity]" required>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="form-group">
                                <label for="category">Category</label>
                                <select class="form-control" name="line_items[${lineItemIndex}][category]" required>
                                    <option value="">Select Category</option>
                                    <option value="office_supplies">Office Supplies</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="furniture">Furniture</option>
                                    <option value="software">Software</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label for="item_reason">Item Reason</label>
                                <input type="text" class="form-control" name="line_items[${lineItemIndex}][item_reason]" required>
                            </div>
                        </div>
                        <div class="col-md-1 d-flex align-items-end">
                            <button type="button" class="btn btn-danger remove-item">Remove</button>
                        </div>
                    `;
    lineItemsContainer.appendChild(newItem);
    lineItemIndex++;
});

// Remove a line item
document.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("remove-item")) {
        e.target.closest(".line-item").remove();
    }
});

// Handle form submission
document
    .getElementById("submit-form")
    .addEventListener("click", async function () {
        const formData = new FormData(
            document.getElementById("requisition-form")
        );

        // Prepare requisition data
        const requisitionData = {
            request_number: formData.get("request_number"),
            description: formData.get("description"),
            line_items: [],
        };

        // Collect line items data
        for (let i = 0; formData.has(`line_items[${i}][item_name]`); i++) {
            requisitionData.line_items.push({
                item_name: formData.get(`line_items[${i}][item_name]`),
                quantity: parseInt(formData.get(`line_items[${i}][quantity]`)),
                category: formData.get(`line_items[${i}][category]`),
                item_reason: formData.get(`line_items[${i}][item_reason]`),
            });
        }

        // Add file attachment if present
        const attachment = document.getElementById("attachment").files[0];
        if (attachment) {
            requisitionData.attachment = attachment;
        }

        // Create the request body as FormData and append the JSON part manually
        const requestFormData = new FormData();
        requestFormData.append(
            "requisition_input",
            JSON.stringify(requisitionData)
        );

        if (attachment) {
            requestFormData.append("attachment", attachment);
        }

        // Submit data to the server
        try {
            const response = await fetch("/requisition/create-requisition", {
                method: "POST",
                body: requestFormData,
            });

            if (response.ok) {
                // Check if the response is JSON
                const contentType = response.headers.get("Content-Type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    console.log(data); // Logs the response data from the server

                    // Handle success
                    alert("Requisition created successfully");
                    window.location.href = "/dashboard"; // Redirect to another page (dashboard or relevant page)
                } else {
                    alert("Unexpected response format.");
                }
            } else {
                // If response is not ok, try to parse the error message
                const contentType = response.headers.get("Content-Type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message || "An error occurred"}`);
                    console.error(errorData);
                } else {
                    alert("An unexpected error occurred.");
                }
            }
        } catch (error) {
            alert("An error occurred while submitting the form.");
            console.error(error);
        }
    });

// Function to open the modal and load items based on the selected category
function openModal(requisition_id) {
    fetch(`/category/${requisition_id}/items`)
        .then((response) => response.json())
        .then((data) => {
            const tableBody = document.querySelector('#itemTable tbody');
            tableBody.innerHTML = '';  // Clear existing items in modal

            // Loop through the items and add them to the modal
            data.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.item_name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.category}</td>
                    <td>${item.item_reason}</td>
                `;
                tableBody.appendChild(row);
            });

            // Show the modal using Bootstrap's modal method
            const myModal = new bootstrap.Modal(document.getElementById('myModal'));
            myModal.show();  // Open the modal
        })
        .catch((err) => alert("Error fetching items: " + err));
}

// Function to close the modal
function closeModal() {
    const myModal = new bootstrap.Modal(document.getElementById('myModal'));
    myModal.hide();  // Close the modal using Bootstrap's modal method
}

// Close modal if clicked outside of modal content
window.onclick = function (event) {
    if (event.target == document.getElementById("myModal")) {
        closeModal();
    }
};


// Function to approve a requisition
function approveRequisition(id) {
    $.post("/requisition/approve_requisition", { id: id })
        .done(function(response) {
            if (response.status === "success") {
                alert(response.message);
                $('#status-' + id).text("Approved");
                window.location.href = "/requisition/pending_request"; // Refresh page

            } else {
                alert(response.message);
            }
        })
        .fail(function() {
            alert("An error occurred while approving the requisition.");
        });
}

// Function to reject a requisition
function rejectRequisition(id) {
    if (confirm('Are you sure you want to reject this requisition?')) {
        $.post("/requisition/reject_requisition", { id: id })
            .done(function(response) {
                if (response.status === "success") {
                    alert(response.message);
                    $('#status-' + id).text("Rejected");
                    window.location.href = "/requisition/pending_request"; // Refresh page

                } else {
                    alert(response.message);
                }
            })
            .fail(function() {
                alert("An error occurred while rejecting the requisition.");
                window.location.href = "/auth/login"; // Redirect to another page (dashboard or relevant page)

            });
    }
}