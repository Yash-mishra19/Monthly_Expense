// Wait until page fully loads
$(document).ready(function () {

    // ================= GLOBAL VARIABLES =================
    let totalIncome = 0;
    let totalExpense = 0;

    // Get saved transactions from LocalStorage
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    // ================= SAVE FUNCTION =================
    function saveToLocalStorage() {
        localStorage.setItem("transactions", JSON.stringify(transactions));
    }

    // ================= UPDATE DASHBOARD =================
    function updateDashboard() {

        $("#totalIncome").text("₹" + totalIncome);
        $("#totalExpense").text("₹" + totalExpense);

        let balance = totalIncome - totalExpense;
        $("#balance").text("₹" + balance);

        if (balance < 0) {
            $("#balance").css("color", "red");
        } else {
            $("#balance").css("color", "#2563eb");
        }
    }

    // ================= RENDER TRANSACTIONS =================
    function renderTransactions() {

        $("#transactionTable").empty();

        // Reset totals
        totalIncome = 0;
        totalExpense = 0;

        // Reset category totals
        let foodTotal = 0;
        let travelTotal = 0;
        let shoppingTotal = 0;
        let billsTotal = 0;

        if (transactions.length === 0) {
            $("#transactionTable").append(`
                <tr id="emptyMessage">
                    <td colspan="5">No transactions added yet</td>
                </tr>
            `);

            // Reset category display
            $("#foodTotal").text("₹0");
            $("#travelTotal").text("₹0");
            $("#shoppingTotal").text("₹0");
            $("#billsTotal").text("₹0");

            updateDashboard();
            return;
        }

        transactions.forEach(function (t, index) {

            let newRow = `
                <tr data-index="${index}">
                    <td>₹${t.amount}</td>
                    <td>${t.category}</td>
                    <td>${t.type}</td>
                    <td>${t.date}</td>
                    <td>
                        <button class="btn btn-danger btn-sm deleteBtn">
                            Delete
                        </button>
                    </td>
                </tr>
            `;

            $("#transactionTable").append(newRow);

            // Calculate totals
            if (t.type === "Income") {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;

                // Category-wise expense calculation
                if (t.category === "Food") {
                    foodTotal += t.amount;
                } else if (t.category === "Travel") {
                    travelTotal += t.amount;
                } else if (t.category === "Shopping") {
                    shoppingTotal += t.amount;
                } else if (t.category === "Bills") {
                    billsTotal += t.amount;
                }
            }
        });

        // Update category summary display
        $("#foodTotal").text("₹" + foodTotal);
        $("#travelTotal").text("₹" + travelTotal);
        $("#shoppingTotal").text("₹" + shoppingTotal);
        $("#billsTotal").text("₹" + billsTotal);

        updateDashboard();
    }

    // ================= FORM SUBMIT =================
    $("#transactionForm").submit(function (event) {

        event.preventDefault();

        let amount = parseFloat($("#amount").val());
        let category = $("#category").val();
        let type = $("#type").val();
        let date = $("#date").val();

        if (amount <= 0 || isNaN(amount)) {
            alert("Please enter a valid amount");
            return;
        }

        let transaction = {
            amount: amount,
            category: category,
            type: type,
            date: date
        };

        transactions.push(transaction);

        saveToLocalStorage();
        renderTransactions();

        $("#transactionForm")[0].reset();
    });

    // ================= DELETE TRANSACTION =================
   // ================= DELETE TRANSACTION WITH CONFIRMATION =================
$(document).on("click", ".deleteBtn", function () {

    let row = $(this).closest("tr");
    let index = row.data("index");

    let confirmDelete = confirm("Are you sure you want to delete this transaction?");

    if (confirmDelete) {

        row.fadeOut(300, function () {
            transactions.splice(index, 1);
            saveToLocalStorage();
            renderTransactions();
        });

    }

});

    // ================= DARK MODE TOGGLE =================
    $("#themeToggle").click(function () {

        $("body").toggleClass("dark-mode");

        let isDark = $("body").hasClass("dark-mode");

        localStorage.setItem("darkMode", isDark);

        if (isDark) {
            $(this).text("☀ Light Mode");
        } else {
            $(this).text("🌙 Dark Mode");
        }
    });

    // ================= LOAD DARK MODE ON START =================
    let savedTheme = localStorage.getItem("darkMode");

    if (savedTheme === "true") {
        $("body").addClass("dark-mode");
        $("#themeToggle").text("☀ Light Mode");
    }

    
   // ================= SEARCH FILTER =================
$("#searchInput").on("keyup", function () {

    let value = $(this).val().toLowerCase();
    let matchFound = false;

    $("#transactionTable tr").each(function () {

        if ($(this).attr("id") === "emptyMessage" || 
            $(this).attr("id") === "noMatchMessage") {
            return;
        }

        let rowText = $(this).text().toLowerCase();

        if (rowText.indexOf(value) > -1) {
            $(this).show();
            matchFound = true;
        } else {
            $(this).hide();
        }
    });

    // Remove old noMatchMessage if exists
    $("#noMatchMessage").remove();

    if (!matchFound && value !== "") {
        $("#transactionTable").append(`
            <tr id="noMatchMessage">
                <td colspan="5">No matching transactions found</td>
            </tr>
        `);
    }
});
    // ================= EXPORT TO CSV =================
$("#downloadCSV").click(function () {

    if (transactions.length === 0) {
        alert("No transactions to export!");
        return;
    }

    let csvContent = "Amount,Category,Type,Date\n";

    transactions.forEach(function (t) {
        csvContent += `${t.amount},${t.category},${t.type},${t.date}\n`;
    });

    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    let link = document.createElement("a");
    let url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "SpendSmart_Report.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

    // ================= INITIAL LOAD =================
    renderTransactions();

});