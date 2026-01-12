'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    BookOpen,
    ShoppingCart,
    Calendar,
    BarChart3
} from 'lucide-react';

interface AnalyticsData {
    overview: {
        totalRevenue: number;
        revenueGrowth: number;
        totalUsers: number;
        userGrowth: number;
        totalOrders: number;
        orderGrowth: number;
        totalCourses: number;
        courseGrowth: number;
    };
    revenueByMonth: Array<{
        month: string;
        revenue: number;
        orders: number;
    }>;
    topCourses: Array<{
        _id: string;
        title: string;
        revenue: number;
        enrollments: number;
    }>;
    paymentMethods: Array<{
        method: string;
        count: number;
        revenue: number;
    }>;
    userRegistrations: Array<{
        date: string;
        count: number;
    }>;
    orderStatus: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
}

export default function AdminAnalyticsDashboard() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    };

    if (loading) {
        return <div className="animate-pulse">Loading analytics...</div>;
    }

    if (!analytics) {
        return <div className="text-center py-8">Failed to load analytics data.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Platform Analytics</h2>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analytics.overview.totalRevenue)}
                        </div>
                        <div className={`text-xs flex items-center ${analytics.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {analytics.overview.revenueGrowth >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {formatPercentage(analytics.overview.revenueGrowth)} from last period
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
                        <div className={`text-xs flex items-center ${analytics.overview.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {analytics.overview.userGrowth >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {formatPercentage(analytics.overview.userGrowth)} from last period
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.overview.totalOrders}</div>
                        <div className={`text-xs flex items-center ${analytics.overview.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {analytics.overview.orderGrowth >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {formatPercentage(analytics.overview.orderGrowth)} from last period
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.overview.totalCourses}</div>
                        <div className={`text-xs flex items-center ${analytics.overview.courseGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {analytics.overview.courseGrowth >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {formatPercentage(analytics.overview.courseGrowth)} from last period
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Month */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2" />
                            Revenue Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.revenueByMonth.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{item.month}</p>
                                        <p className="text-sm text-gray-500">{item.orders} orders</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(item.revenue)}</p>
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min((item.revenue / Math.max(...analytics.revenueByMonth.map(r => r.revenue))) * 100, 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Courses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.topCourses.map((course, index) => (
                                <div key={course._id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{course.title}</p>
                                        <p className="text-sm text-gray-500">{course.enrollments} enrollments</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(course.revenue)}</p>
                                        <p className="text-xs text-gray-500">#{index + 1}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Order Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics.orderStatus.map((status) => (
                                <div key={status.status} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${status.status === 'completed' ? 'bg-green-500' :
                                                status.status === 'pending' ? 'bg-yellow-500' :
                                                    status.status === 'failed' ? 'bg-red-500' :
                                                        'bg-gray-500'
                                            }`}></div>
                                        <span className="capitalize">{status.status}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-medium">{status.count}</span>
                                        <span className="text-sm text-gray-500 ml-2">({status.percentage.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics.paymentMethods.map((method) => (
                                <div key={method.method} className="flex items-center justify-between">
                                    <span className="capitalize">{method.method}</span>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(method.revenue)}</p>
                                        <p className="text-sm text-gray-500">{method.count} transactions</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Registration Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        User Registration Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                        {analytics.userRegistrations.map((registration, index) => (
                            <div key={index} className="text-center">
                                <p className="text-xs text-gray-500 mb-1">
                                    {new Date(registration.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <div className="bg-blue-100 rounded p-2">
                                    <p className="font-medium text-sm">{registration.count}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
