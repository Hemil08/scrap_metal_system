import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchScrapRecords } from '../redux/scrapSlice';
import { fetchInventory } from '../redux/inventorySlice';
import { fetchSales } from '../redux/salesSlice';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Boxes,
  TrendingUp,
  Recycle,
  Cpu,
  ArrowUpRight,
  TrendingDown,
  Clock,
  ChevronRight
} from 'lucide-react';


const Dashboard = () => {

    

  return (
    <div>Dashboard</div>
  )
}

export default Dashboard