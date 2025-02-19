import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useDispatch } from 'react-redux';
import useRealtimeData from '@/app/components/hooks/commHooks/useRealtimeData';
import { useSecureUserId } from '@/app/components/utils/useSecureUserId';
import { RealtimeActions } from '@/app/components/actions/RealtimeActions';
import { RealtimeDataItem } from './RealtimeData';

interface RealTimeChartProps {
  user: string;
  searchQuery: string;
  selectedFilters: string[];
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({ user, searchQuery, selectedFilters }) => {
  const dispatch = useDispatch();

  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Real-Time Data',
        data: [] as number[],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: false,
      },
    ],
  });

  const { fetchData } = useRealtimeData([], (data, events, snapshotStore, dataItems: RealtimeDataItem[]) => {
    const updatedLabels = dataItems.map(item => item.timestamp?.toString()).filter(label => label !== undefined) as string[];
    const updatedData = dataItems.map(item => item.value);

      setChartData((prevState) => ({
        ...prevState,
        labels: updatedLabels,
        datasets: [
          {
            ...prevState.datasets[0],
            data: updatedData.map(Number),
          },
        ],
      }));

    // Dispatch action with fetched data
    dispatch(RealtimeActions.fetchRealtimeDataSuccess({ data: dataItems }));
  });

  const secureUserId = useSecureUserId();

  useEffect(() => {
    fetchData(String(secureUserId), () => {});
  }, [user, searchQuery, selectedFilters, fetchData, secureUserId]);

  return (
    <div>
      <h2>Real-Time Data Chart</h2>
      <Line data={chartData} />
    </div>
  );
};

export default RealTimeChart;
