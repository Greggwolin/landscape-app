// app/components/Budget/BudgetContent.tsx
import React, { useState, useEffect } from 'react';

interface AcquisitionEvent {
    acquisition_id: number;
    event_date: string;
    event_type: string;
    description: string;
    amount: number;
    is_applied_to_purchase: boolean;
    units_conveyed: number | null;
    seller_name: string;
    seller_contact: string;
    measure_code: string;
    notes: string;
}

interface BudgetStructure {
    structure_id: number;
    scope: string;
    category: string;
    detail: string;
    cost_method: string;
    measure_code: string;
    start_period: number | null;
    periods_to_complete: number | null;
    budget_item_id: number | null;
    amount: number | null;
    quantity: number | null;
    cost_per_unit: number | null;
    notes: string | null;
}

const BudgetContent: React.FC = () => {
    const [acquisitionEvents, setAcquisitionEvents] = useState<AcquisitionEvent[]>([]);
    const [budgetStructure, setBudgetStructure] = useState<BudgetStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedScopes, setExpandedScopes] = useState<{ [key: string]: boolean }>({
        'Acquisition': true,
        'Stage 1': true,
        'Stage 2': true,
        'Stage 3': true,
        'Project': true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [acquisitionRes, budgetRes] = await Promise.all([
                fetch('/api/acquisition'),
                fetch('/api/budget-structure')
            ]);

            const acquisitionData = await acquisitionRes.json();
            const budgetData = await budgetRes.json();

            setAcquisitionEvents(acquisitionData);
            setBudgetStructure(budgetData);
        } catch (error) {
            console.error('Error fetching budget data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const groupedBudget = budgetStructure.reduce((acc, item) => {
        if (!acc[item.scope]) acc[item.scope] = {};
        if (!acc[item.scope][item.category]) acc[item.scope][item.category] = [];
        acc[item.scope][item.category].push(item);
        return acc;
    }, {} as { [scope: string]: { [category: string]: BudgetStructure[] } });

    const toggleScope = (scope: string) => {
        setExpandedScopes(prev => ({ ...prev, [scope]: !prev[scope] }));
    };

    const getTotalByScope = (scope: string) => {
        return budgetStructure
            .filter(item => item.scope === scope && item.amount)
            .reduce((sum, item) => sum + (item.amount || 0), 0);
    };

    if (loading) {
        return (
            <div className="p-4 flex items-center justify-center">
                <div className="text-gray-400">Loading budget data...</div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 bg-gray-950">
            {/* Budget Summary */}
            <div className="bg-gray-800 rounded border border-gray-700 p-4">
                <div className="text-xs text-gray-400 mb-1">
                    Budget Items: {budgetStructure.length} structure items, {acquisitionEvents.length} acquisition events
                </div>
                <div className="text-sm font-medium text-white">
                    Total Budget: {formatCurrency(
                        budgetStructure.reduce((sum, item) => sum + (item.amount || 0), 0) +
                        acquisitionEvents.reduce((sum, event) => sum + (event.amount || 0), 0)
                    )}
                </div>
            </div>

            {/* Hierarchical Budget Structure */}
            {Object.keys(groupedBudget).map(scope => (
                <div key={scope} className="bg-gray-800 rounded border border-gray-700">
                    <div
                        className="px-4 py-2 border-b border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-700"
                        onClick={() => toggleScope(scope)}
                    >
                        <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-white text-sm">{scope.toUpperCase()}</h3>
                            <span className="text-xs text-gray-400">
                                {formatCurrency(getTotalByScope(scope))}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                                Add Item
                            </button>
                            <span className="text-gray-400">
                                {expandedScopes[scope] ? '▲' : '▼'}
                            </span>
                        </div>
                    </div>

                    {expandedScopes[scope] && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-900">
                                    <tr>
                                        <th className="text-left px-2 py-1 font-medium text-gray-300 w-32">Category</th>
                                        <th className="text-left px-2 py-1 font-medium text-gray-300">Detail</th>
                                        <th className="text-center px-2 py-1 font-medium text-gray-300 w-20">Method</th>
                                        <th className="text-right px-2 py-1 font-medium text-gray-300 w-24">Cost/Unit</th>
                                        <th className="text-center px-2 py-1 font-medium text-gray-300 w-20">Quantity</th>
                                        {scope.startsWith('Stage') && (
                                            <>
                                                <th className="text-center px-2 py-1 font-medium text-gray-300 w-20">Start Period</th>
                                                <th className="text-center px-2 py-1 font-medium text-gray-300 w-20">Periods</th>
                                            </>
                                        )}
                                        <th className="text-right px-2 py-1 font-medium text-gray-300 w-24">Total</th>
                                        <th className="text-center px-2 py-1 font-medium text-gray-300 w-16">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(groupedBudget[scope]).map(category =>
                                        groupedBudget[scope][category].map((item, index) => (
                                            <tr key={item.structure_id} className={`border-b border-gray-700 hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`}>
                                                <td className="px-2 py-1.5 text-gray-300 font-medium">{item.category}</td>
                                                <td className="px-2 py-1.5 text-gray-300">{item.detail}</td>
                                                <td className="px-2 py-1.5 text-center">
                                                    <span className="px-1.5 py-0.5 rounded text-xs bg-blue-900 text-blue-300">
                                                        {item.cost_method}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1.5 text-right text-gray-300">
                                                    {item.cost_per_unit ? formatCurrency(item.cost_per_unit) : '-'}
                                                </td>
                                                <td className="px-2 py-1.5 text-center text-gray-300">
                                                    {item.quantity || '-'}
                                                </td>
                                                {scope.startsWith('Stage') && (
                                                    <>
                                                        <td className="px-2 py-1.5 text-center text-gray-300">
                                                            {item.start_period || '-'}
                                                        </td>
                                                        <td className="px-2 py-1.5 text-center text-gray-300">
                                                            {item.periods_to_complete || '-'}
                                                        </td>
                                                    </>
                                                )}
                                                <td className="px-2 py-1.5 text-right text-gray-300">
                                                    {item.amount ? formatCurrency(item.amount) : '-'}
                                                </td>
                                                <td className="px-2 py-1.5 text-center">
                                                    <button className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600">
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default BudgetContent;