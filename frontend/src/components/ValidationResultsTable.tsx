'use client';

import React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Chip, Paper, Typography, Box } from '@mui/material';

interface ValidationResult {
    field: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    expected: string;
    comment: string;
}

interface ValidationResultsTableProps {
    results: ValidationResult[];
    extractedFields: Record<string, any>;
}

export default function ValidationResultsTable({ results, extractedFields }: ValidationResultsTableProps) {
    if (!results || results.length === 0) return null;

    const rows = results.map((res, index) => ({
        id: index,
        attribute: res.field,
        provided: extractedFields[res.field] || '-',
        expected: res.expected,
        status: res.status,
        comment: res.comment,
    }));

    const columns: GridColDef[] = [
        { field: 'attribute', headerName: 'Attribute', width: 180 },
        { field: 'provided', headerName: 'Provided', width: 150 },
        { field: 'expected', headerName: 'Expected', width: 150 },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params: GridRenderCellParams) => {
                let color: 'success' | 'warning' | 'error' | 'default' = 'default';
                if (params.value === 'PASS') color = 'success';
                if (params.value === 'WARN') color = 'warning';
                if (params.value === 'FAIL') color = 'error';
                return <Chip label={params.value as string} color={color} size="small" />;
            },
        },
        { field: 'comment', headerName: 'Comment', width: 400, flex: 1 },
    ];

    return (
        <Paper elevation={3} sx={{ p: 3, height: 500, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Validation Results
            </Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                pageSizeOptions={[5, 10]}
            />
        </Paper>
    );
}
