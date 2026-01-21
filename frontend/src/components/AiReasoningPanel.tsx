'use client';

import React from 'react';
import { Drawer, Box, Typography, Divider, LinearProgress } from '@mui/material';

interface AiReasoningPanelProps {
    open: boolean;
    onClose: () => void;
    confidence: number;
    reasoning: string;
}

export default function AiReasoningPanel({ open, onClose, confidence, reasoning }: AiReasoningPanelProps) {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
        >
            <Box sx={{ width: 350, p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    AI Reasoning
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Confidence Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={confidence * 100} />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{`${Math.round(confidence * 100)}%`}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {reasoning}
                </Typography>

                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="caption" display="block">
                        Note: This validation is probabilistic. Always verify critical engineering decisions with official standards documents.
                    </Typography>
                </Box>
            </Box>
        </Drawer>
    );
}
