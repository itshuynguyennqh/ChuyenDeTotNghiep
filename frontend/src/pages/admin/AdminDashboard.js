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
  Chip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  LineChart,
  Line,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import StarIcon from '@mui/icons-material/Star';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
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
  
  // New state for expanded sections
  const [revenueChartPeriod, setRevenueChartPeriod] = useState('week'); // 'week', 'month', 'custom'
  const [revenueChartStartDate, setRevenueChartStartDate] = useState('');
  const [revenueChartEndDate, setRevenueChartEndDate] = useState('');
  const [revenueChartView, setRevenueChartView] = useState('bar'); // 'bar', 'line', 'stacked'

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const metricsRes = await getDashboardMetrics();
      
      // Transform backend data format
      if (metricsRes.data?.data) {
        const dashboardData = metricsRes.data.data;
        
        // Set metrics from summary
        if (dashboardData.summary) {
          setMetrics({
            totalRevenue: parseFloat(dashboardData.summary.total_revenue?.value || 0),
            revenueChange: dashboardData.summary.total_revenue?.growth_percentage || 0,
            activeRentals: dashboardData.summary.active_rental?.value || 0,
            totalCustomers: dashboardData.summary.total_customers?.value || 0,
            overdueReturns: dashboardData.summary.overdue_return?.value || 0,
          });
        }
        
        // Transform revenue chart data
        if (dashboardData.revenue_chart) {
          const chartData = dashboardData.revenue_chart.labels.map((label, index) => {
            const salesSeries = dashboardData.revenue_chart.series.find(s => s.name === 'Sales');
            const rentalsSeries = dashboardData.revenue_chart.series.find(s => s.name === 'Rentals');
            return {
              day: label,
              sell: parseFloat(salesSeries?.data[index] || 0),
              rent: parseFloat(rentalsSeries?.data[index] || 0),
            };
          });
          setSalesRentData(chartData);
        }
        
        // Transform inventory data
        if (dashboardData.inventory_status) {
          const breakdown = dashboardData.inventory_status.breakdown || [];
          setInventoryData({
            total_items: dashboardData.inventory_status.total_items || 0,
            available: breakdown.find(b => b.status === 'available')?.value || 0,
            renting: breakdown.find(b => b.status === 'renting')?.value || 0,
            maintenance: breakdown.find(b => b.status === 'maintenance')?.value || 0,
            breakdown: breakdown,
          });
        }
      }
      
      loadReports();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const revenueRes = await getRevenueReport(reportStartDate, reportEndDate);
      
      // Transform backend response structure
      if (revenueRes.data?.data) {
        const reportData = revenueRes.data.data;
        
        // Set revenue report
        if (reportData.revenue_report) {
          setRevenueReport({
            reportPeriodRevenue: parseFloat(reportData.revenue_report.total_revenue || 0),
            totalOrders: reportData.revenue_report.total_orders || 0,
            avgDailyRevenue: parseFloat(reportData.revenue_report.avg_daily_revenue || 0),
          });
        }
        
        // Set top selling products
        if (reportData.top_selling_products) {
          setTopSelling(reportData.top_selling_products.map(item => ({
            rank: item.rank,
            productName: item.product_name,
            category: item.category_name,
            image: item.image_url,
            quantitySold: item.quantity_sold || 0,
            revenue: parseFloat(item.revenue || 0),
          })));
        }
        
        // Set top rented products
        if (reportData.top_rented_products) {
          setTopRented(reportData.top_rented_products.map(item => ({
            rank: item.rank,
            productName: item.product_name,
            category: item.category_name,
            image: item.image_url,
            timesRented: item.times_rented || 0,
            revenue: parseFloat(item.revenue || 0),
          })));
        }
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleGenerateReport = () => {
    loadReports();
  };

  const inventoryChartData = inventoryData
    ? [
        { name: 'Available', value: inventoryData.available, color: COLORS.available },
        { name: 'Renting', value: inventoryData.renting, color: COLORS.renting },
        { name: 'Maintenance', value: inventoryData.maintenance, color: COLORS.maintenance },
      ]
    : [];

  // Calculate revenue statistics
  const revenueStats = salesRentData.length > 0 ? (() => {
    const totalSales = salesRentData.reduce((sum, item) => sum + (item.sell || 0), 0);
    const totalRent = salesRentData.reduce((sum, item) => sum + (item.rent || 0), 0);
    const totalRevenue = totalSales + totalRent;
    const total = totalSales + totalRent;
    
    return {
      totalSales,
      totalRent,
      totalRevenue,
      avgDailySales: salesRentData.length > 0 ? totalSales / salesRentData.length : 0,
      avgDailyRent: salesRentData.length > 0 ? totalRent / salesRentData.length : 0,
      salesPercentage: total > 0 ? (totalSales / total) * 100 : 0,
    };
  })() : null;

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
            value={`$${(metrics?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={metrics?.revenueChange}
            icon={<TrendingUpIcon sx={{ color: '#1976D2', fontSize: '2rem' }} />}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Rental"
            value={(metrics?.activeRentals || 0).toLocaleString()}
            icon={<DirectionsBikeIcon sx={{ color: '#FF9800', fontSize: '2rem' }} />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Customers"
            value={(metrics?.totalCustomers || 0).toLocaleString()}
            icon={<PeopleIcon sx={{ color: '#4CAF50', fontSize: '2rem' }} />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue Return"
            value={(metrics?.overdueReturns || 0).toLocaleString()}
            icon={<WarningIcon sx={{ color: '#F44336', fontSize: '2rem' }} />}
            color="#F44336"
            attention={(metrics?.overdueReturns || 0) > 0}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales vs Rent Revenue Chart - EXPANDED */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Sales vs Rent Revenue
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comparing income streams over time
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={revenueChartPeriod}
                    label="Period"
                    onChange={(e) => setRevenueChartPeriod(e.target.value)}
                  >
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>View</InputLabel>
                  <Select
                    value={revenueChartView}
                    label="View"
                    onChange={(e) => setRevenueChartView(e.target.value)}
                  >
                    <MenuItem value="bar">Bar</MenuItem>
                    <MenuItem value="line">Line</MenuItem>
                    <MenuItem value="stacked">Stacked</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={loadDashboardData}
                  variant="outlined"
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            {/* Revenue Statistics Cards */}
            {revenueStats && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#FFF3E0', borderLeft: `4px solid ${COLORS.sell}` }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Sales
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        ${revenueStats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#E3F2FD', borderLeft: `4px solid ${COLORS.rent}` }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Rent
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        ${revenueStats.totalRent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#F1F8E9', borderLeft: '4px solid #4CAF50' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Revenue
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        ${revenueStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#FCE4EC', borderLeft: '4px solid #E91E63' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="caption" color="text.secondary">
                        Sales Ratio
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {revenueStats.salesPercentage.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Chart */}
            <ResponsiveContainer width="100%" height={350}>
              {revenueChartView === 'line' ? (
                <LineChart data={salesRentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <Legend />
                  <Line type="monotone" dataKey="sell" stroke={COLORS.sell} strokeWidth={2} name="Sales" />
                  <Line type="monotone" dataKey="rent" stroke={COLORS.rent} strokeWidth={2} name="Rentals" />
                </LineChart>
              ) : (
                <BarChart data={salesRentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <Legend />
                  {revenueChartView === 'stacked' ? (
                    <>
                      <Bar dataKey="sell" stackId="a" fill={COLORS.sell} name="Sales" />
                      <Bar dataKey="rent" stackId="a" fill={COLORS.rent} name="Rentals" />
                    </>
                  ) : (
                    <>
                      <Bar dataKey="sell" fill={COLORS.sell} name="Sales" />
                      <Bar dataKey="rent" fill={COLORS.rent} name="Rentals" />
                    </>
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>

            {/* Average Daily Stats */}
            {revenueStats && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<TrendingUpIcon />}
                  label={`Avg Daily Sales: $${revenueStats.avgDailySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  icon={<DirectionsBikeIcon />}
                  label={`Avg Daily Rent: $${revenueStats.avgDailyRent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Inventory Status Chart - EXPANDED */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Inventory Status
              </Typography>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={loadDashboardData}
                variant="outlined"
              >
                Refresh
              </Button>
            </Box>

            {/* Total Items Card */}
            {inventoryData && (
              <Card sx={{ mb: 2, bgcolor: '#F5F5F5' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryIcon sx={{ color: '#1976D2' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Items
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {inventoryData.total_items.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={inventoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <Divider sx={{ my: 2 }} />

            {/* Detailed Breakdown */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
                Breakdown
              </Typography>
              {inventoryData?.breakdown?.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: item.status === 'available' ? '#E8F5E9' : 
                             item.status === 'renting' ? '#FFF3E0' : '#FFEBEE',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.status === 'available' && <CheckCircleIcon sx={{ color: COLORS.available, fontSize: '1.2rem' }} />}
                    {item.status === 'renting' && <DirectionsBikeIcon sx={{ color: COLORS.renting, fontSize: '1.2rem' }} />}
                    {item.status === 'maintenance' && <BuildIcon sx={{ color: COLORS.maintenance, fontSize: '1.2rem' }} />}
                    <Typography variant="body2" fontWeight="medium">
                      {item.label}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {item.value?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.percentage?.toFixed(1) || 0}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Availability Rate */}
            {inventoryData && inventoryData.total_items > 0 && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#E3F2FD', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Availability Rate
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976D2' }}>
                  {((inventoryData.available / inventoryData.total_items) * 100).toFixed(1)}%
                </Typography>
              </Box>
            )}
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
