export const formatDateDisplay = (dateStr?: string): string => {
  if (!dateStr) return 'Not Specified';
  
  const trimmed = dateStr.trim();

  // If in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-');
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${parseInt(day, 10)} ${months[mIdx]} ${year}`;
    }
  }

  // If already in DD Month YYYY format
  if (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // Fallback to JS Date object parsing
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }
  } catch (e) {
    // ignore
  }

  return dateStr;
};

export const parseDateToObj = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-');
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }
  
  const months: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };
  
  const match = trimmed.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const mStr = match[2].toLowerCase();
    const year = parseInt(match[3], 10);
    if (months[mStr] !== undefined) {
      return new Date(year, months[mStr], day);
    }
  }
  
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
};

export const calculateDaysDifference = (origStr?: string, reqStr?: string): string => {
  if (!origStr || !reqStr) return 'No change';
  const d1 = parseDateToObj(origStr);
  const d2 = parseDateToObj(reqStr);
  if (!d1 || !d2) return 'No change';
  
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Same day (0 days)';
  if (diffDays > 0) return `+${diffDays} days`;
  return `${diffDays} days`;
};

export const formatDateInput = (dateStr?: string): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const d = parseDateToObj(trimmed);
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
