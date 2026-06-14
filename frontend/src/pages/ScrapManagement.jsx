import React, {useState, useEffect, useRef} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchScrapRecords,
  addScrapRecord,
  editScrapRecord,
  removeScrapRecord
} from '../redux/scrapSlice';