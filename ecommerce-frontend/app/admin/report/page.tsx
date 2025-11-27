'use client';

import React, { useEffect, useState } from 'react';
import {
  fetchAdminDashboard,
  fetchRevenueByDayInMonth,
  fetchRevenueByWeek,
  fetchRevenueByMonth,
  fetchRevenueByYear,
  fetchTopSellingProducts
} from '@/app/services/api';
import Chart from 'react-apexcharts';
import { format } from 'date-fns';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Calendar,
  BarChart3,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap
} from 'lucide-react';

export default function ReportPage() {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [revenueType, setRevenueType] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [statRevenueType, setStatRevenueType] = useState<'day' | 'week' | 'month' | 'year'>('day');

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardRes = await fetchAdminDashboard();
        const topRes = await fetchTopSellingProducts(5);

        let revenueRes;
        switch (revenueType) {
          case 'week':
            revenueRes = await fetchRevenueByWeek();
            break;
          case 'month':
            revenueRes = await fetchRevenueByMonth(year);
            break;
          case 'year':
            revenueRes = await fetchRevenueByYear();
            break;
          default:
            revenueRes = await fetchRevenueByDayInMonth(year, month);
        }

        setStats(dashboardRes);
        setRevenueData(revenueRes.data || []);
        setTopProducts(topRes.data || []);
      } catch (error) {
        console.error('Không thể tải dữ liệu thống kê', error);
      }
    };

    loadData();
  }, [revenueType]);

  useEffect(() => {
    const loadStatRevenue = async () => {
      try {
        let revenueRes;
        switch (statRevenueType) {
          case 'week':
            revenueRes = await fetchRevenueByWeek();
            setTotalRevenue(
              (revenueRes.data || []).reduce((sum: number, item: any) => sum + (item.total || 0), 0)
            );
            break;
          case 'month':
            revenueRes = await fetchRevenueByMonth(year);
            setTotalRevenue(
              (revenueRes.data || []).reduce((sum: number, item: any) => sum + (item.total || 0), 0)
            );
            break;
          case 'year':
            revenueRes = await fetchRevenueByYear();
            setTotalRevenue(
              (revenueRes.data || []).reduce((sum: number, item: any) => sum + (item.total || 0), 0)
            );
            break;
          default:
            revenueRes = await fetchRevenueByDayInMonth(year, month);
            const todayStr = format(today, 'yyyy-MM-dd');
            const todayRevenue = revenueRes.data.find((d: any) => {
              try {
                if (!d.date) return false;
                const dateObj = new Date(d.date);
                if (isNaN(dateObj.getTime())) return false;
                return format(dateObj, 'yyyy-MM-dd') === todayStr;
              } catch (error) {
                console.warn('Lỗi so sánh date:', d.date, error);
                return false;
              }
            });
            setTotalRevenue(todayRevenue?.total || 0);
        }
      } catch (error) {
        console.error('Không thể tải doanh thu tổng', error);
        setTotalRevenue(0);
      }
    };

    loadStatRevenue();
  }, [statRevenueType]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <div className="p-3 bg-blue-500 rounded-2xl mr-4">
                  <BarChart3 className="text-white" size={32} />
                </div>
                Báo Cáo Thống Kê
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Phân tích chi tiết hiệu suất kinh doanh</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full px-6 py-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Activity className="text-green-500" size={20} />
                  <span className="text-sm font-medium text-gray-700">Real-time Data</span>
                </div>
              </div>
              <div className="bg-blue-500 text-white rounded-full px-6 py-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="size={20}" />
                  <span className="text-sm font-medium">Live Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModernStatCard
              icon={<ShoppingCart className="text-white" size={24} />}
              label="Tổng Đơn Hàng"
              value={stats.totalOrders}
              gradient="from-blue-500 to-blue-600"
              trend={{ value: 12.5, isPositive: true }}
            />
            <ModernStatCard
              icon={<Package className="text-white" size={24} />}
              label="Sản Phẩm Đang Bán"
              value={stats.activeProducts}
              gradient="from-green-500 to-green-600"
              trend={{ value: 8.2, isPositive: true }}
            />
            <ModernStatCard
              icon={<Users className="text-white" size={24} />}
              label="Tổng Người Dùng"
              value={stats.totalUsers}
              gradient="from-purple-500 to-purple-600"
              trend={{ value: 15.3, isPositive: true }}
            />
            <ModernStatCardWithDropdown
              icon={<DollarSign className="text-white" size={24} />}
              label="Doanh Thu"
              value={Number(totalRevenue).toLocaleString('vi-VN') + '₫'}
              gradient="from-orange-500 to-orange-600"
              selected={statRevenueType}
              onChange={setStatRevenueType}
              trend={{ value: 23.7, isPositive: true }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">Đang tải dữ liệu thống kê...</p>
            </div>
          </div>
        )}

        {/* Revenue Chart */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
                <TrendingUp className="mr-3 text-blue-500" size={28} />
                Phân Tích Doanh Thu
              </h2>
              <p className="text-gray-600">Theo dõi xu hướng tăng trưởng doanh thu</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="flex bg-gray-100 rounded-xl p-1">
                {[
                  { value: 'day', label: 'Ngày' },
                  { value: 'week', label: 'Tuần' },
                  { value: 'month', label: 'Tháng' },
                  { value: 'year', label: 'Năm' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRevenueType(option.value as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      revenueType === option.value
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {revenueData.length > 0 ? (
            <div className="bg-gray-50 rounded-2xl p-6">
              <Chart
                type="area"
                height={400}
                options={{
                  chart: { 
                    id: 'revenue-chart',
                    toolbar: { show: true },
                    background: 'transparent'
                  },
                  xaxis: {
                    categories: revenueData.map((d) => {
                      switch (revenueType) {
                        case 'week': return `Tuần ${d.week}`;
                        case 'month': return `Tháng ${d.month}`;
                        case 'year': return `Năm ${d.year}`;
                        default: {
                          try {
                            if (!d.date) return 'N/A';
                            const dateObj = new Date(d.date);
                            if (isNaN(dateObj.getTime())) return 'N/A';
                            return format(dateObj, 'dd/MM');
                          } catch (error) {
                            console.warn('Lỗi format date:', d.date, error);
                            return 'N/A';
                          }
                        }
                      }
                    }),
                    labels: { style: { colors: '#6B7280' } }
                  },
                  yaxis: {
                    labels: { 
                      formatter: (val) => (val / 1000000).toFixed(1) + 'M ₫',
                      style: { colors: '#6B7280' }
                    }
                  },
                  tooltip: {
                    y: { formatter: (val) => val.toLocaleString('vi-VN') + ' ₫' }
                  },
                  stroke: { 
                    curve: 'smooth',
                    width: 3
                  },
                  fill: {
                    type: 'gradient',
                    gradient: {
                      shadeIntensity: 1,
                      opacityFrom: 0.7,
                      opacityTo: 0.1,
                      stops: [0, 100]
                    }
                  },
                  colors: ['#3B82F6', '#8B5CF6'],
                  dataLabels: { enabled: false },
                  grid: {
                    borderColor: '#E5E7EB',
                    strokeDashArray: 3
                  }
                }}
                series={[{
                  name: 'Doanh thu',
                  data: revenueData.map((d) => d.total)
                }]}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">Không có dữ liệu doanh thu</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <div className="p-3 bg-yellow-500 rounded-2xl mr-4">
              <Trophy className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Top 5 Sản Phẩm Bán Chạy</h2>
              <p className="text-gray-600">Sản phẩm được yêu thích nhất</p>
            </div>
          </div>
          
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      idx === 0 ? 'bg-yellow-500' :
                      idx === 1 ? 'bg-gray-400' :
                      idx === 2 ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {idx === 0 ? ' Hàng đầu' : 
                         idx === 1 ? ' Hàng nhì' : 
                         idx === 2 ? ' Hàng ba' : 
                         'Sản phẩm phổ biến'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{item.totalSold}</div>
                    <div className="text-sm text-gray-500">đã bán</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">Không có dữ liệu sản phẩm bán chạy</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModernStatCard({ 
  icon, 
  label, 
  value, 
  gradient, 
  trend 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: any; 
  gradient: string; 
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-blue-500 rounded-xl shadow-lg`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend.value}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-600">{label}</div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );
}

function ModernStatCardWithDropdown({
  icon,
  label,
  value,
  gradient,
  selected,
  onChange,
  trend
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
  selected: 'day' | 'week' | 'month' | 'year';
  onChange: (val: 'day' | 'week' | 'month' | 'year') => void;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-blue-500 rounded-xl shadow-lg`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend.value}%
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">{label}</div>
            <select
              className="text-xs bg-gray-100 border-0 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={selected}
              onChange={(e) => onChange(e.target.value as any)}
            >
              <option value="day">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );
}
