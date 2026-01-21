import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Switch, FormControlLabel, Alert, CircularProgress, Button } from '@mui/material';
import { getSettingsAPI, updateSettingsAPI } from '../../api/userApi';

const Settings = () => {
    const [settings, setSettings] = useState({
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        newsletter: false,
        privacy_mode: false,
        two_factor_enabled: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await getSettingsAPI();
            const settingsData = response.data?.data || response.data || {};
            setSettings({
                email_notifications: settingsData.email_notifications !== undefined ? settingsData.email_notifications : true,
                sms_notifications: settingsData.sms_notifications !== undefined ? settingsData.sms_notifications : false,
                push_notifications: settingsData.push_notifications !== undefined ? settingsData.push_notifications : true,
                newsletter: settingsData.newsletter !== undefined ? settingsData.newsletter : false,
                privacy_mode: settingsData.privacy_mode !== undefined ? settingsData.privacy_mode : false,
                two_factor_enabled: settingsData.two_factor_enabled !== undefined ? settingsData.two_factor_enabled : false
            });
        } catch (err) {
            setError('Failed to load settings');
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (key) => (event) => {
        setSettings({ ...settings, [key]: event.target.checked });
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            await updateSettingsAPI(settings);
            setSuccess('Settings saved successfully!');
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Account Settings</Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper variant="outlined" sx={{ p: 4, borderRadius: '20px' }}>
                <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 3 }}>
                    Notification Preferences
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.email_notifications}
                                onChange={handleSettingChange('email_notifications')}
                                color="primary"
                            />
                        }
                        label="Email Notifications"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 2 }}>
                        Receive notifications via email
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.sms_notifications}
                                onChange={handleSettingChange('sms_notifications')}
                                color="primary"
                            />
                        }
                        label="SMS Notifications"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 2 }}>
                        Receive notifications via SMS
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.push_notifications}
                                onChange={handleSettingChange('push_notifications')}
                                color="primary"
                            />
                        }
                        label="Push Notifications"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 2 }}>
                        Receive push notifications in browser
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.newsletter}
                                onChange={handleSettingChange('newsletter')}
                                color="primary"
                            />
                        }
                        label="Newsletter"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 2 }}>
                        Subscribe to our newsletter for updates and promotions
                    </Typography>
                </Box>

                <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 3, mt: 4 }}>
                    Privacy & Security
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.privacy_mode}
                                onChange={handleSettingChange('privacy_mode')}
                                color="primary"
                            />
                        }
                        label="Privacy Mode"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 2 }}>
                        Hide your profile from other users
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.two_factor_enabled}
                                onChange={handleSettingChange('two_factor_enabled')}
                                color="primary"
                            />
                        }
                        label="Two-Factor Authentication"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 2 }}>
                        Enable two-factor authentication for enhanced security
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button 
                        variant="contained" 
                        onClick={handleSaveSettings}
                        disabled={saving}
                        sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#e67e00' } }}
                    >
                        {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Settings'}
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={loadSettings}
                        disabled={saving}
                    >
                        Reset
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Settings;
