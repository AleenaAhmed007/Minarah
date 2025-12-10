// src/hooks/useFloodData.js
import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";

export const useFloodData = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Papa.parse("/data/combined_flood_data.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = (results.data || [])
          .map((r) => {
            const month = Number(r.Month) || Number(r.month);
            const year = Number(r.Year) || Number(r.year);
            const temp = Number(r.Temp ?? r.temp) || 0;
            const ice = Number(r.Ice ?? r.ice) || 0;
            const veg = Number(r.Veg ?? r.veg) || 0;
            const flood = Number(r.Flood ?? r.flood) || 0;
            const rain = Number(r.Rain_mm ?? r.rain_mm ?? r.Rain ?? r.rain) || 0;
            const province = (r.Province || r.province || "").toString().trim() || "Unknown";

            const monthPadded = String(month).padStart(2, "0");
            const dateLabel = year && month ? `${year}-${monthPadded}` : `${year || "Unknown"}`;

            return { month, year, dateLabel, temp, ice, veg, flood, rain, province };
          })
          .filter((r) => r.year && r.province);

        setRows(parsed);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message || "Failed to load CSV");
        setLoading(false);
      },
    });
  }, []);

  // Derived data
  const chartData = useMemo(() => {
    if (!rows.length) {
      return {
        labelsByDate: [],
        tempSeries: [],
        vegSeries: [],
        floodCountsByProvince: {},
        avgRainByProvince: {},
        floodVsNoFlood: { yes: 0, no: 0 },
      };
    }

    const sorted = [...rows].sort((a, b) => {
      if (a.year === b.year) return (a.month || 0) - (b.month || 0);
      return a.year - b.year;
    });

    const timeBuckets = {};
    for (const r of sorted) {
      if (!timeBuckets[r.dateLabel]) {
        timeBuckets[r.dateLabel] = { tempSum: 0, vegSum: 0, count: 0 };
      }
      timeBuckets[r.dateLabel].tempSum += r.temp;
      timeBuckets[r.dateLabel].vegSum += r.veg;
      timeBuckets[r.dateLabel].count += 1;
    }

    const labels = Object.keys(timeBuckets);
    const tempSeries = labels.map((lbl) =>
      +(timeBuckets[lbl].tempSum / timeBuckets[lbl].count).toFixed(2)
    );
    const vegSeries = labels.map((lbl) =>
      +(timeBuckets[lbl].vegSum / timeBuckets[lbl].count).toFixed(2)
    );

    const floodCounts = {};
    const rainAgg = {};
    let floodYes = 0;
    let floodNo = 0;

    for (const r of rows) {
      const p = r.province || "Unknown";
      floodCounts[p] = (floodCounts[p] || 0) + (r.flood ? 1 : 0);
      if (!rainAgg[p]) rainAgg[p] = { sum: 0, count: 0 };
      rainAgg[p].sum += r.rain;
      rainAgg[p].count += 1;
      if (r.flood) floodYes += 1;
      else floodNo += 1;
    }

    const avgRain = {};
    for (const p of Object.keys(rainAgg)) {
      avgRain[p] = +(rainAgg[p].sum / rainAgg[p].count).toFixed(2);
    }

    return {
      labelsByDate: labels,
      tempSeries,
      vegSeries,
      floodCountsByProvince: floodCounts,
      avgRainByProvince: avgRain,
      floodVsNoFlood: { yes: floodYes, no: floodNo },
    };
  }, [rows]);

  const summary = {
    rows: rows.length,
    provinces: [...new Set(rows.map((r) => r.province))].length,
    floods: rows.filter((r) => r.flood).length,
  };

  return { rows, loading, error, chartData, summary };
};