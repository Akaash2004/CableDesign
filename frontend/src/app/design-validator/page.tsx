'use client';

import React, { useState } from 'react';
import { Container, Typography, Box, Button, CssBaseline, ThemeProvider, createTheme, Paper } from '@mui/material';
import DesignInputForm from '@/components/DesignInputForm';
import ValidationResultsTable from '@/components/ValidationResultsTable';
import AiReasoningPanel from '@/components/AiReasoningPanel';
import DesignServicesIcon from '@mui/icons-material/DesignServices';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#f48fb1',
        },
    },
});

export default function DesignValidatorPage() {
    const [results, setResults] = useState<any[]>([]);
    const [extractedFields, setExtractedFields] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [confidence, setConfidence] = useState(0);
    const [reasoning, setReasoning] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Default to localhost:3000 -> localhost:3000/api proxy? No, backend is on 3000, frontend on 3001?
    // Check ports. NestJS 3000 default. NextJS 3000 default. One will move.
    // Assuming Backend is 3000, Frontend started second so probably 3001.
    const API_URL = 'http://localhost:3000/design/validate';

    const handleValidate = async (data: any) => {
        setIsLoading(true);
        setResults([]);
        setExtractedFields({});

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Validation failed');
            }

            const result = await response.json();
            setExtractedFields(result.fields || {});
            setResults(result.validation || []);
            setConfidence(result.confidence?.overall || 0);
            setReasoning(result.reasoning || 'No specific reasoning provided by AI.');
            setDrawerOpen(true);
        } catch (error) {
            console.error('Error validating design:', error);
            alert('Failed to validate design. Ensure backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <DesignServicesIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h3" component="h1" fontWeight="bold">
                        Cable Design Validator
                    </Typography>
                </Box>

                <DesignInputForm onValidate={handleValidate} isLoading={isLoading} />

                {results.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: confidence > 0.8 ? 'success.main' : confidence > 0.5 ? 'warning.main' : 'error.main' }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Overall System Confidence:
                                </Typography>
                                <Typography variant="h6" color={confidence > 0.8 ? 'success.main' : confidence > 0.5 ? 'warning.main' : 'error.main'} fontWeight="bold">
                                    {Math.round(confidence * 100)}%
                                </Typography>
                            </Paper>
                            <Button variant="outlined" onClick={() => setDrawerOpen(true)}>
                                View AI Reasoning
                            </Button>
                        </Box>
                        <ValidationResultsTable results={results} extractedFields={extractedFields} />
                    </Box>
                )}

                <AiReasoningPanel
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    confidence={confidence}
                    reasoning={reasoning}
                />
            </Container>
        </ThemeProvider>
    );
}
