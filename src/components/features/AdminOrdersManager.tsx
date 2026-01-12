'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, RefreshCw } from 'lucide-react';

interface Order {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    items: Array<{
        type: string;
        itemId: string;
        price: number;
        title: string;
    }>;
    totalAmount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    paymentDetails: any;
    createdAt: string;
    updatedAt: string;
}

export default function AdminOrdersManager() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/admin/orders');
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.razorpayOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                await fetchOrders();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Failed to update order status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="animate-pulse">Loading orders...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={fetchOrders} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Orders ({filteredOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Order ID</th>
                                    <th className="text-left p-2">Customer</th>
                                    <th className="text-left p-2">Items</th>
                                    <th className="text-left p-2">Amount</th>
                                    <th className="text-left p-2">Status</th>
                                    <th className="text-left p-2">Date</th>
                                    <th className="text-left p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">
                                            <div>
                                                <p className="font-mono text-sm">{order.razorpayOrderId}</p>
                                                {order.razorpayPaymentId && (
                                                    <p className="font-mono text-xs text-gray-500">
                                                        {order.razorpayPaymentId}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-2">
                                            <div>
                                                <p className="font-medium">{order.userId?.name || 'Unknown'}</p>
                                                <p className="text-sm text-gray-500">{order.userId?.email || 'No email'}</p>
                                            </div>
                                        </td>
                                        <td className="p-2">
                                            <div>
                                                <p className="text-sm">{order.items.length} item(s)</p>
                                                <p className="text-xs text-gray-500">
                                                    {order.items.map(item => item.title).join(', ')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-2">
                                            <span className="font-semibold">₹{order.totalAmount}</span>
                                        </td>
                                        <td className="p-2">
                                            <Badge className={getStatusColor(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="p-2">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-2">
                                            <div className="flex space-x-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {order.status === 'completed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateOrderStatus(order._id, 'refunded')}
                                                    >
                                                        Refund
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No orders found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Order Details</h3>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedOrder(null)}
                            >
                                Close
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Order ID</label>
                                    <p className="font-mono">{selectedOrder.razorpayOrderId}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Payment ID</label>
                                    <p className="font-mono">{selectedOrder.razorpayPaymentId || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Customer</label>
                                    <p>{selectedOrder.userId?.name}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.userId?.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <Badge className={getStatusColor(selectedOrder.status)}>
                                        {selectedOrder.status}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                                    <p className="text-lg font-semibold">₹{selectedOrder.totalAmount}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Date</label>
                                    <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Items</label>
                                <div className="mt-2 space-y-2">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-medium">{item.title}</p>
                                                <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                                            </div>
                                            <p className="font-semibold">₹{item.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedOrder.paymentDetails && Object.keys(selectedOrder.paymentDetails).length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Payment Details</label>
                                    <pre className="mt-2 p-2 bg-gray-50 rounded text-sm overflow-x-auto">
                                        {JSON.stringify(selectedOrder.paymentDetails, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
