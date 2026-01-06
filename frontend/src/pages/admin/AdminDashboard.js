import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import StarIcon from '@mui/icons-material/Star';
import {
  getDashboardMetrics,
  getSalesVsRentRevenue,
  getInventoryStatus,
  getRevenueReport,
  getTopSellingProducts,
  getTopRentedProducts,
} from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';

const COLORS = {
  sell: '#FF9800',
  rent: '#2196F3',
  available: '#9CCC65',
  renting: '#FF9800',
  maintenance: '#F44336',
};

const StatCard = ({ title, value, change, icon, color, attention }) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: `4px solid ${color}`,
      boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    }}
  >
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        {icon}
      </Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
        {value}
      </Typography>
      {change && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUpIcon sx={{ fontSize: '1rem', color: '#4CAF50' }} />
          <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 500 }}>
            +{change}%
          </Typography>
        </Box>
      )}
      {attention && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
          <WarningIcon sx={{ fontSize: '1rem', color: '#F44336' }} />
          <Typography variant="caption" sx={{ color: '#F44336', fontWeight: 500 }}>
            Attention required
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [salesRentData, setSalesRentData] = useState([]);
  const [inventoryData, setInventoryData] = useState(null);
  const [reportTab, setReportTab] = useState(0);
  const [reportStartDate, setReportStartDate] = useState('2023-10-01');
  const [reportEndDate, setReportEndDate] = useState('2023-10-31');
  const [revenueReport, setRevenueReport] = useState(null);
  const [topSelling, setTopSelling] = useState([]);
  const [topRented, setTopRented] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, salesRentRes, inventoryRes] = await Promise.all([
        getDashboardMetrics(),
        getSalesVsRentRevenue(),
        getInventoryStatus(),
      ]);
      setMetrics(metricsRes.data);
      setSalesRentData(salesRentRes.data);
      setInventoryData(inventoryRes.data);
      loadReports();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const [revenueRes, sellingRes, rentedRes] = await Promise.all([
        getRevenueReport(reportStartDate, reportEndDate),
        getTopSellingProducts(reportStartDate, reportEndDate),
        getTopRentedProducts(reportStartDate, reportEndDate),
      ]);
      setRevenueReport(revenueRes.data);
      setTopSelling(sellingRes.data);
      setTopRented(rentedRes.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleGenerateReport = () => {
    loadReports();
  };

  const inventoryChartData = inventoryData
    ? [
        { name: 'Available', value: inventoryData.available },
        { name: 'Renting', value: inventoryData.renting },
        { name: 'Maintenance', value: inventoryData.maintenance },
      ]
    : [];

  const reportColumns = {
    selling: [
      { id: 'rank', label: 'RANK', align: 'left' },
      { id: 'productName', label: 'PRODUCT NAME' },
      { id: 'quantitySold', label: 'QUANTITY SOLD', align: 'right' },
      { id: 'revenue', label: 'REVENUE', align: 'right' },
    ],
    rented: [
      { id: 'rank', label: 'RANK', align: 'left' },
      { id: 'productName', label: 'PRODUCT NAME' },
      { id: 'timesRented', label: 'TIMES RENTED', align: 'right' },
      { id: 'revenue', label: 'REVENUE', align: 'right' },
    ],
  };

  const formatReportRows = (data, type) => {
    return data.map((item) => ({
      id: item.rank,
      rank: `#${item.rank}`,
      productName: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src={item.image || '/placeholder.png'}
            alt={item.productName}
            sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
          />
          <Box>
            <Typography variant="body2" fontWeight="bold" sx={{ color: '#1976D2' }}>
              {item.productName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.category}
            </Typography>
          </Box>
        </Box>
      ),
      quantitySold: item.quantitySold,
      timesRented: item.timesRented,
      revenue: `$${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: '#1A1A2E' }}>
        Overview
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${metrics?.totalRevenue.toLocaleString() || '0'}`}
            change={metrics?.revenueChange}
            icon={<TrendingUpIcon sx={{ color: '#1976D2', fontSize: '2rem' }} />}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Rental"
            value={metrics?.activeRentals || 0}
            icon={<DirectionsBikeIcon sx={{ color: '#FF9800', fontSize: '2rem' }} />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Customers"
            value={metrics?.totalCustomers.toLocaleString() || '0'}
            icon={<PeopleIcon sx={{ color: '#4CAF50', fontSize: '2rem' }} />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue Return"
            value={metrics?.overdueReturns || 0}
            icon={<WarningIcon sx={{ color: '#F44336', fontSize: '2rem' }} />}
            color="#F44336"
            attention={metrics?.overdueReturns > 0}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales vs Rent Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Sales vs Rent Revenue
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comparing income streams
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesRentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sell" stackId="a" fill={COLORS.sell} name="Sell" />
                <Bar dataKey="rent" stackId="a" fill={COLORS.rent} name="Rent" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Inventory Status Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Inventory Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === 'Available'
                          ? COLORS.available
                          : entry.name === 'Renting'
                          ? COLORS.renting
                          : COLORS.maintenance
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {inventoryChartData.map((item) => (
                <Box
                  key={item.name}
                  sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                >
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {((item.value / inventoryChartData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(0)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Reports Section */}
      <Paper sx={{ p: 3, boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={reportTab} onChange={(e, newValue) => setReportTab(newValue)}>
            <Tab
              icon={<TrendingUpIcon />}
              iconPosition="start"
              label="Revenue Report"
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<StarIcon />}
              iconPosition="start"
              label="Top Selling Products"
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<DirectionsBikeIcon />}
              iconPosition="start"
              label="Top Rented Products"
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Box>

        {/* Report Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            type="date"
            label="From"
            value={reportStartDate}
            onChange={(e) => setReportStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            type="date"
            label="To"
            value={reportEndDate}
            onChange={(e) => setReportEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleGenerateReport}
            sx={{ backgroundColor: '#1976D2' }}
          >
            Generate Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{ ml: 'auto' }}
          >
            Export to Excel
          </Button>
        </Box>

        {/* Report Content */}
        {reportTab === 0 && revenueReport && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    REPORT PERIOD REVENUE
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${revenueReport.reportPeriodRevenue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    TOTAL ORDERS
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {revenueReport.totalOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    AVG. DAILY REVENUE
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${revenueReport.avgDailyRevenue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {reportTab === 1 && (
          <DataTable
            columns={reportColumns.selling}
            rows={formatReportRows(topSelling, 'selling')}
            emptyMessage="No data available"
          />
        )}

        {reportTab === 2 && (
          <DataTable
            columns={reportColumns.rented}
            rows={formatReportRows(topRented, 'rented')}
            emptyMessage="No data available"
          />
        )}
      </Paper>
    </Box>
  );
}

export default AdminDashboard;
