import React from 'react';
import { Coffee, Pizza, Drumstick } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useHostel } from '@/context/useHostel';

const StudentMess = () => {
    const { messMenu } = useHostel();

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const sortedMenu = [...messMenu].sort((a, b) => {
        return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
    });

    const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

    const mealIcons = {
        breakfast: Coffee,
        lunch: Pizza,
        dinner: Drumstick,
    };

    return (
        <MainLayout>
            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }} className="animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4" style={{ marginBottom: '28px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
                            Mess Menu
                        </h1>
                        <p style={{ fontSize: '13px', color: '#737373', marginTop: '4px' }}>
                            Weekly meal schedule and timings
                        </p>
                    </div>
                    <span style={{
                        fontSize: '11px', fontWeight: 500, padding: '4px 12px',
                        borderRadius: '12px', backgroundColor: '#F5F5F5', color: '#1E1E1E'
                    }}>
                        {currentDay}
                    </span>
                </div>

                {/* Menu Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    {sortedMenu.map((day, index) => {
                        const isToday = day.day === currentDay;
                        return (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '10px',
                                    border: isToday ? '1.5px solid #1E1E1E' : '1px solid #E5E5E5',
                                    padding: '20px',
                                    position: 'relative',
                                    transition: 'border-color 0.15s'
                                }}
                                className="animate-slide-up"
                            >
                                {isToday && (
                                    <span style={{
                                        position: 'absolute', top: '12px', right: '12px',
                                        fontSize: '9px', fontWeight: 600, padding: '2px 8px',
                                        borderRadius: '10px', backgroundColor: '#1E1E1E', color: '#FFFFFF',
                                        textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>
                                        Today
                                    </span>
                                )}
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', marginBottom: '16px' }}>
                                    {day.day}
                                </div>

                                {[
                                    { label: 'Breakfast', value: day.breakfast, icon: mealIcons.breakfast },
                                    { label: 'Lunch', value: day.lunch, icon: mealIcons.lunch },
                                    { label: 'Dinner', value: day.dinner, icon: mealIcons.dinner },
                                ].map((meal, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                                        paddingBottom: i < 2 ? '12px' : 0,
                                        marginBottom: i < 2 ? '12px' : 0,
                                        borderBottom: i < 2 ? '1px solid #F5F5F5' : 'none'
                                    }}>
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '6px',
                                            backgroundColor: '#F5F5F5',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <meal.icon style={{ width: '14px', height: '14px', color: '#525252' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '10px', fontWeight: 600, color: '#737373', letterSpacing: '0.05em', marginBottom: '2px' }}>
                                                {meal.label.toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: '12px', fontWeight: 500, color: '#1E1E1E', lineHeight: '1.5' }}>
                                                {meal.value}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </MainLayout>
    );
};

export default StudentMess;
