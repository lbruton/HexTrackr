/* JavaScript Fixes for AG Grid Responsiveness */

document.addEventListener('DOMContentLoaded', () => {
    const gridOptions = {
        columnDefs: [
            { headerName: 'Date', field: 'date', resizable: true },
            { headerName: 'Hostname', field: 'hostname', resizable: true },
            { headerName: 'IP Address', field: 'ipAddress', resizable: true },
            { headerName: 'Severity', field: 'severity', resizable: true },
            { headerName: 'CVE Info', field: 'cveInfo', resizable: true },
            { headerName: 'Vendor', field: 'vendor', resizable: true },
            { headerName: 'Description', field: 'description', resizable: true },
            { headerName: 'VPR Score', field: 'vprScore', resizable: true },
            { headerName: 'State', field: 'state', resizable: true },
            { headerName: 'Actions', field: 'actions', resizable: true },
        ],
        defaultColDef: {
            flex: 1,
            minWidth: 100,
        },
        pagination: true,
        paginationPageSize: 50,
        onGridReady: (params) => {
            params.api.sizeColumnsToFit();
        },
    };

    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    window.addEventListener('resize', () => {
        gridOptions.api.sizeColumnsToFit();
    });
});
