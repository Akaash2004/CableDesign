'use client';

import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Tabs,
    Tab,
    Typography,
    Paper,
    Grid,
} from '@mui/material';

interface DesignInputFormProps {
    onValidate: (data: any) => void;
    isLoading: boolean;
}

export default function DesignInputForm({ onValidate, isLoading }: DesignInputFormProps) {
    const [tabIndex, setTabIndex] = useState(0);
    const [freeText, setFreeText] = useState('IEC 60502-1, 0.6/1 kV, Cu, Class 2, 10 mm², PVC, insulation 1.0 mm');
    const [structuredData, setStructuredData] = useState({
        standard: 'IEC 60502-1',
        voltage: '0.6/1 kV',
        conductor_material: 'Cu',
        conductor_class: 'Class 2',
        csa: 10,
        insulation_material: 'PVC',
        insulation_thickness: 1.0,
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const handleStructuredChange = (field: string, value: string | number) => {
        setStructuredData({ ...structuredData, [field]: value });
    };

    const handleSubmit = () => {
        if (tabIndex === 0) {
            onValidate({ structuredData });
        } else {
            onValidate({ freeText });
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
                Cable Design Input
            </Typography>
            <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label="Structured Input" />
                <Tab label="Free-Text Input" />
            </Tabs>

            {tabIndex === 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                        <TextField
                            fullWidth
                            label="Standard"
                            value={structuredData.standard}
                            onChange={(e) => handleStructuredChange('standard', e.target.value)}
                        />
                    </Box>
                    <Box>
                        <TextField
                            fullWidth
                            label="Voltage"
                            value={structuredData.voltage}
                            onChange={(e) => handleStructuredChange('voltage', e.target.value)}
                        />
                    </Box>
                    <Box>
                        <TextField
                            fullWidth
                            label="Conductor Material"
                            value={structuredData.conductor_material}
                            onChange={(e) => handleStructuredChange('conductor_material', e.target.value)}
                        />
                    </Box>
                    <Box>
                        <TextField
                            fullWidth
                            label="Conductor Class"
                            value={structuredData.conductor_class}
                            onChange={(e) => handleStructuredChange('conductor_class', e.target.value)}
                        />
                    </Box>
                    <Box>
                        <TextField
                            fullWidth
                            type="number"
                            label="CSA (mm²)"
                            value={structuredData.csa}
                            onChange={(e) => handleStructuredChange('csa', parseFloat(e.target.value))}
                        />
                    </Box>
                    <Box>
                        <TextField
                            fullWidth
                            label="Insulation Material"
                            value={structuredData.insulation_material}
                            onChange={(e) => handleStructuredChange('insulation_material', e.target.value)}
                        />
                    </Box>
                    <Box>
                        <TextField
                            fullWidth
                            type="number"
                            label="Insulation Thickness (mm)"
                            value={structuredData.insulation_thickness}
                            onChange={(e) => handleStructuredChange('insulation_thickness', parseFloat(e.target.value))}
                        />
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Enter Cable Description"
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    placeholder="e.g., IEC 60502-1 cable, 10 sqmm Cu Class 2..."
                />
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" size="large" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Validating...' : 'Validate Design'}
                </Button>
            </Box>
        </Paper>
    );
}
