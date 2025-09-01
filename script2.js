document.addEventListener('DOMContentLoaded', function() {
    
    // --- SAMPLE DATA (State management) ---
    // Using 'let' to allow the array to be modified (for deletion)
    let complaintsData = [
        { id: 81350, name: 'Rohan Mehta', department: 'Roads', issue: 'Large pothole on Waghodia Rd', submitted: '2025-09-01', status: 'Pending' },
        { id: 81349, name: 'Sneha Desai', department: 'Sanitation', issue: 'Irregular garbage collection', submitted: '2025-08-31', status: 'InProgress' },
        { id: 81348, name: 'Vikram Singh', department: 'Water Works', issue: 'Leaking pipe in Karelibaug', submitted: '2025-08-31', status: 'Pending' },
        { id: 81347, name: 'Anjali Patel', department: 'Electrical', issue: 'Street light not working', submitted: '2025-08-30', status: 'Resolved' },
        { id: 81346, name: 'Manish Shah', department: 'Drainage', issue: 'Clogged drain near station', submitted: '2025-08-29', status: 'Resolved' },
        { id: 81345, name: 'Pooja Joshi', department: 'Roads', issue: 'Broken pavement in Alkapuri', submitted: '2025-08-28', status: 'InProgress' },
        { id: 81344, name: 'Amit Kumar', department: 'Sanitation', issue: 'Overflowing dustbin', submitted: '2025-08-27', status: 'Resolved' },
        { id: 81343, name: 'Deepika Rao', department: 'Water Works', issue: 'Low water pressure', submitted: '2025-08-26', status: 'Resolved' },
        { id: 81342, name: 'Karan Nair', department: 'Electrical', issue: 'Exposed electrical wiring', submitted: '2025-08-25', status: 'Pending' },
    ];
    
    // --- ELEMENT SELECTORS ---
    const tableBody = document.getElementById('complaints-table-body');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const modal = document.getElementById('detailsModal');
    const modalBody = document.getElementById('modalBody');
    const closeModalButton = document.querySelector('.close-button');


    // --- RENDER TABLE ---
    function renderTable(data) {
        tableBody.innerHTML = ''; // Clear existing table
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">No complaints found.</td></tr>`;
            return;
        }
        data.forEach(complaint => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${complaint.id}</td>
                <td>${complaint.name}</td>
                <td>${complaint.department}</td>
                <td>${complaint.issue}</td>
                <td>${complaint.submitted}</td>
                <td><span class="status-pill status-${complaint.status}">${complaint.status === 'InProgress' ? 'In Progress' : complaint.status}</span></td>
                <td class="action-buttons">
                    <button class="btn-resolve" title="Mark as Resolved"><i class="fa-solid fa-check"></i></button>
                    <button class="btn-details" title="View Details"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn-delete" title="Delete Complaint"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // --- FILTER AND SEARCH ---
    function filterAndSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const status = statusFilter.value;
        
        let filteredData = complaintsData;

        if (status !== 'All') {
            filteredData = filteredData.filter(c => c.status === status);
        }

        if (searchTerm) {
            filteredData = filteredData.filter(c => 
                c.name.toLowerCase().includes(searchTerm) ||
                c.issue.toLowerCase().includes(searchTerm) ||
                String(c.id).includes(searchTerm)
            );
        }
        renderTable(filteredData);
    }
    
    // --- UPDATE KPI CARDS ---
    function updateKpis() {
        const total = complaintsData.length;
        const pending = complaintsData.filter(c => c.status === 'Pending' || c.status === 'InProgress').length;
        const resolvedThisMonth = complaintsData.filter(c => c.status === 'Resolved' && new Date(c.submitted).getMonth() === new Date().getMonth()).length;
        // Dummy data for overdue
        const overdue = complaintsData.filter(c => c.status === 'Pending').length - 1; 

        document.getElementById('total-complaints').textContent = total;
        document.getElementById('pending-complaints').textContent = pending;
        document.getElementById('resolved-complaints').textContent = resolvedThisMonth;
        document.getElementById('overdue-complaints').textContent = overdue > 0 ? overdue : 0;
    }

    // --- ACTION FUNCTIONS ---
    function handleDelete(id) {
        if (confirm(`Are you sure you want to delete complaint #${id}? This action cannot be undone.`)) {
            complaintsData = complaintsData.filter(c => c.id !== id);
            filterAndSearch(); // Re-render the table with current filters
            updateKpis();
        }
    }

    function handleResolve(id) {
        const complaint = complaintsData.find(c => c.id === id);
        if (complaint && complaint.status !== 'Resolved') {
            complaint.status = 'Resolved';
            filterAndSearch();
            updateKpis();
        } else if (complaint) {
            alert('This complaint has already been resolved.');
        }
    }

    function handleDetails(id) {
        const complaint = complaintsData.find(c => c.id === id);
        if (complaint) {
            modalBody.innerHTML = `
                <p><strong>Complaint ID:</strong> #${complaint.id}</p>
                <p><strong>Citizen Name:</strong> ${complaint.name}</p>
                <p><strong>Department:</strong> ${complaint.department}</p>
                <p><strong>Issue Details:</strong> ${complaint.issue}</p>
                <p><strong>Date Submitted:</strong> ${complaint.submitted}</p>
                <p><strong>Current Status:</strong> <span class="status-pill status-${complaint.status}">${complaint.status}</span></p>
            `;
            modal.style.display = "block";
        }
    }
    
    // --- EVENT HANDLERS ---
    searchInput.addEventListener('input', filterAndSearch);
    statusFilter.addEventListener('change', filterAndSearch);

    // Event delegation for all action buttons in the table
    tableBody.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return; // Exit if the click wasn't on a button

        const row = target.closest('tr');
        const complaintId = parseInt(row.querySelector('td').textContent.replace('#', ''));

        if (target.classList.contains('btn-delete')) {
            handleDelete(complaintId);
        } else if (target.classList.contains('btn-resolve')) {
            handleResolve(complaintId);
        } else if (target.classList.contains('btn-details')) {
            handleDetails(complaintId);
        }
    });

    // Modal close events
    closeModalButton.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = "none";
        }
    });

    // --- INITIAL LOAD ---
    renderTable(complaintsData);
    updateKpis();
});