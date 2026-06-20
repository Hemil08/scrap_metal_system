import React, { useState, useRef } from 'react';
import { aiAPI } from '../services/api';
import {
  Cpu,
  Upload,
  Loader2,
  Sparkles,
  Scale,
  Activity,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

const AIClassification = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);

    
}