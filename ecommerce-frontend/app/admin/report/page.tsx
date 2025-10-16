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
        setRevenueData(revenueRes.data);
        setTopProducts(topRes.data);
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
              revenueRes.data.reduce((sum: number, item: any) => sum + item.total, 0)
            );
            break;
          case 'month':
            revenueRes = await fetchRevenueByMonth(year);
            setTotalRevenue(
              revenueRes.data.reduce((sum: number, item: any) => sum + item.total, 0)
            );
            break;
          case 'year':
            revenueRes = await fetchRevenueByYear();
            setTotalRevenue(
              revenueRes.data.reduce((sum: number, item: any) => sum + item.total, 0)
            );
            break;
          default:
            revenueRes = await fetchRevenueByDayInMonth(year, month);
            const todayStr = format(today, 'yyyy-MM-dd');
            const todayRevenue = revenueRes.data.find((d: any) => d.date === todayStr);
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
    <div className="p-8 space-y-10">
      {/* Các ô thống kê tổng */}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="🛒 Tổng đơn hàng" value={stats.totalOrders} />
          <StatCard label="📦 Sản phẩm đang bán" value={stats.activeProducts} />
          <StatCard label="👥 Người dùng" value={stats.totalUsers} />
          <StatCardWithDropdown
            label="💸 Doanh thu"
            value={Number(totalRevenue).toLocaleString('vi-VN') + 'đ'}
            selected={statRevenueType}
            onChange={setStatRevenueType}
          />
        </div>
      ) : (
        <p className="text-gray-500">Đang tải dữ liệu thống kê...</p>
      )}

      {/* Biểu đồ doanh thu */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">📈 Thống kê doanh thu</h2>
          <select
            className="border rounded px-3 py-1 text-sm"
            value={revenueType}
            onChange={(e) => setRevenueType(e.target.value as any)}
          >
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Theo tháng</option>
            <option value="year">Theo năm</option>
          </select>
        </div>

        {revenueData.length > 0 ? (
          <Chart
            type="line"
            height={350}
            options={{
              chart: { id: 'revenue-chart' },
              xaxis: {
                categories: revenueData.map((d) => {
                  switch (revenueType) {
                    case 'week': return `Tuần ${d.week}`;
                    case 'month': return `Tháng ${d.month}`;
                    case 'year': return `Năm ${d.year}`;
                    default: return format(new Date(d.date), 'dd/MM');
                  }
                }),
                title: { text: 'Thời gian' }
              },
              yaxis: {
                labels: { formatter: (val) => val.toLocaleString('vi-VN') + ' ₫' },
                title: { text: 'Doanh thu (VNĐ)' }
              },
              tooltip: {
                y: { formatter: (val) => val.toLocaleString('vi-VN') + ' ₫' }
              },
              stroke: { curve: 'smooth' },
              dataLabels: { enabled: false },
              colors: ['#1D4ED8']
            }}
            series={[{
              name: 'Doanh thu',
              data: revenueData.map((d) => d.total)
            }]}
          />
        ) : (
          <p className="text-gray-500">Không có dữ liệu doanh thu.</p>
        )}
      </div>

      {/* Bảng top sản phẩm bán chạy */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🏆 Top 5 sản phẩm bán chạy</h2>
        {topProducts.length > 0 ? (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Sản phẩm</th>
                <th className="px-4 py-2">Đã bán</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((item: any, idx: number) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.totalSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Không có dữ liệu sản phẩm bán chạy.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 border-l-4 border-blue-500">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}

function StatCardWithDropdown({
  label,
  value,
  selected,
  onChange
}: {
  label: string;
  value: string;
  selected: 'day' | 'week' | 'month' | 'year';
  onChange: (val: 'day' | 'week' | 'month' | 'year') => void;
}) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">{label}</div>
        <select
          className="text-xs border px-1 py-0.5 rounded"
          value={selected}
          onChange={(e) => onChange(e.target.value as any)}
        >
          <option value="day">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
          <option value="year">Năm nay</option>
        </select>
      </div>
      <div className="text-2xl font-bold text-gray-800 mt-2">{value}</div>
    </div>
  );
}
