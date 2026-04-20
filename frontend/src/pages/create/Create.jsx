import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../helpers/AuthContent';
import { getEndofDayDateTime } from '../../components/utils/dateTimeTools/FormDateTimeTools';
import DatetimeSelector from '../../components/datetimeSelector/DatetimeSelector';
import EmojiPickerInput from '../../components/inputs/EmojiPicker';
import SiteButton from '../../components/buttons/SiteButtons';
import { API_URL } from '../../config';

const CATEGORIES = [
  { id: 'politics', name: 'Politics', icon: 'account_balance' },
  { id: 'crypto', name: 'Crypto', icon: 'currency_bitcoin' },
  { id: 'sports', name: 'Sports', icon: 'sports_soccer' },
  { id: 'business', name: 'Business', icon: 'trending_up' },
  { id: 'science', name: 'Science', icon: 'science' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie' },
  { id: 'other', name: 'Other', icon: 'more_horiz' },
];

const MARKET_TYPES = [
  { 
    id: 'BINARY', 
    name: 'Binary', 
    desc: 'Yes/No outcomes only',
    example: '"Will Sundowns win their next match?"',
    icon: 'swap_horiz'
  },
  { 
    id: 'MULTIPLE_CHOICE', 
    name: 'Multiple Choice', 
    desc: 'Events with 3+ outcomes',
    example: '"Who will win Best Actor?"',
    icon: 'ballot',
  },
];

function Create() {
  const [questionTitle, setQuestionTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resolutionDateTime, setResolutionDateTime] = useState(
    getEndofDayDateTime()
  );
  const [outcomeType, setOutcomeType] = useState('BINARY');
  const [yesLabel, setYesLabel] = useState('');
  const [noLabel, setNoLabel] = useState('');
  const [category, setCategory] = useState('');
  const [options, setOptions] = useState(['', '', '']); // Min 3 options for MC
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { username } = useAuth();
  const history = useHistory();

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 3) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setError('');
    setIsSubmitting(true);

    // Validate category
    if (!category) {
      setError('Please select a category for your market');
      return;
    }

    // Validate based on outcome type
    if (outcomeType === 'MULTIPLE_CHOICE') {
      const filledOptions = options.filter(o => o.trim() !== '');
      if (filledOptions.length < 3) {
        setError('Multiple choice markets require at least 3 options');
        return;
      }
      // Check for duplicates
      const lowerOptions = filledOptions.map(o => o.trim().toLowerCase());
      const uniqueSet = new Set(lowerOptions);
      if (uniqueSet.size !== lowerOptions.length) {
        setError('Options must be unique');
        return;
      }
    } else {
      // Binary validations
      const trimmedYesLabel = yesLabel.trim();
      const trimmedNoLabel = noLabel.trim();
      
      if (trimmedYesLabel && (trimmedYesLabel.length < 1 || trimmedYesLabel.length > 20)) {
        setError('Yes label must be between 1 and 20 characters');
        return;
      }
      
      if (trimmedNoLabel && (trimmedNoLabel.length < 1 || trimmedNoLabel.length > 20)) {
        setError('No label must be between 1 and 20 characters');
        return;
      }
    }

    let isoDateTime = resolutionDateTime;

    if (resolutionDateTime) {
      const dateTime = new Date(resolutionDateTime);
      if (!isNaN(dateTime.getTime())) {
        isoDateTime = dateTime.toISOString();
      } else {
        setError('Invalid date-time value');
        return;
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const marketData = {
        questionTitle,
        description,
        outcomeType,
        resolutionDateTime: isoDateTime,
        initialProbability: 0.5,
        creatorUsername: username,
        isResolved: false,
        utcOffset: new Date().getTimezoneOffset(),
        category,
      };

      if (outcomeType === 'BINARY') {
        marketData.yesLabel = yesLabel.trim() || 'YES';
        marketData.noLabel = noLabel.trim() || 'NO';
      } else {
        // Multiple choice: send options
        marketData.options = options.filter(o => o.trim() !== '').map(o => o.trim());
      }

      const response = await fetch(`${API_URL}/v0/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(marketData),
      });

      if (response.ok) {
        const responseData = await response.json();
        // Redirect using slug if available, fallback to ID
        const marketPath = responseData.slug || responseData.id;
        history.push(`/markets/${marketPath}`);
      } else {
        const errorText = await response.text();
        setError(`Market creation failed: ${errorText}`);
      }
    } catch (err) {
      setError(`Error during market creation: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 sm:px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-black uppercase tracking-tighter text-white">
          Create Market
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-2">
          Launch a prediction market for the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Market Type Selection */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3">
            Market Type <span className="text-[#ddff5c]">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MARKET_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setOutcomeType(type.id)}
                className={`relative border p-4 transition-all text-left ${
                  outcomeType === type.id 
                    ? 'border-[#ddff5c]/30 bg-[#ddff5c]/5'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`material-symbols-outlined text-xl ${outcomeType === type.id ? 'text-[#ddff5c]' : 'text-white/40'}`}>
                    {type.icon}
                  </span>
                  <span className={`text-sm font-black uppercase tracking-wider ${outcomeType === type.id ? 'text-[#ddff5c]' : 'text-white'}`}>
                    {type.name}
                  </span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed">
                  {type.desc} — {type.example}
                </p>
                {outcomeType === type.id && (
                  <div className="absolute top-2 right-2">
                    <span className="material-symbols-outlined text-[#ddff5c] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3">
            Category <span className="text-[#ddff5c]">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-3 border transition-all text-left ${
                  category === cat.id
                    ? 'border-[#ddff5c] bg-[#ddff5c]/10 text-[#ddff5c]'
                    : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/80'
                }`}
              >
                <span className="material-symbols-outlined text-base">{cat.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Question Title */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">
            Question Title <span className="text-[#ddff5c]">*</span>
          </label>
          <EmojiPickerInput
            type='text'
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
            placeholder='e.g., Will Bitcoin hit $100k by end of 2026?'
            className='w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-none text-sm focus:outline-none focus:border-[#ddff5c]/30 transition-all placeholder:text-white/20'
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">
            Description
          </label>
          <EmojiPickerInput
            type='textarea'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Provide resolution criteria and context for your market...'
            className='w-full h-32 resize-y bg-white/5 border border-white/10 text-white px-4 py-3 rounded-none text-sm focus:outline-none focus:border-[#ddff5c]/30 transition-all placeholder:text-white/20'
          />
        </div>

        {/* ========== Conditional: Binary Labels or MC Options ========== */}
        {outcomeType === 'BINARY' ? (
          <>
            {/* Custom Labels for Binary */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3">
                Custom Labels <span className="text-white/20">(Optional)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <EmojiPickerInput
                    type='text'
                    value={yesLabel}
                    onChange={(e) => setYesLabel(e.target.value)}
                    placeholder='e.g., BULL, WIN, PASS'
                    maxLength={20}
                    className='w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-none text-sm focus:outline-none focus:border-[#ddff5c]/30 transition-all placeholder:text-white/20'
                  />
                  <p className='text-[9px] font-black uppercase tracking-widest text-white/20 mt-1.5'>
                    Positive outcome — defaults to "YES"
                  </p>
                </div>
                
                <div>
                  <EmojiPickerInput
                    type='text'
                    value={noLabel}
                    onChange={(e) => setNoLabel(e.target.value)}
                    placeholder='e.g., BEAR, LOSE, FAIL'
                    maxLength={20}
                    className='w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-none text-sm focus:outline-none focus:border-[#ddff5c]/30 transition-all placeholder:text-white/20'
                  />
                  <p className='text-[9px] font-black uppercase tracking-widest text-white/20 mt-1.5'>
                    Negative outcome — defaults to "NO"
                  </p>
                </div>
              </div>
            </div>

            {/* Label Preview */}
            {(yesLabel.trim() || noLabel.trim()) && (
              <div className="bg-white/[0.03] border border-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Preview</p>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-[#ddff5c]/20 text-[#ddff5c] text-sm font-black uppercase tracking-wider">
                    {yesLabel.trim() || 'YES'}
                  </span>
                  <span className="text-white/20 text-xs font-black">vs</span>
                  <span className="px-4 py-1.5 bg-white/10 text-white/80 text-sm font-black uppercase tracking-wider">
                    {noLabel.trim() || 'NO'}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Multiple Choice Options */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3">
                Options <span className="text-[#ddff5c]">*</span>
                <span className="text-white/20 ml-2">({options.length}/10 — min 3)</span>
              </label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white/20 w-6 text-center">{i + 1}</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      maxLength={50}
                      className="flex-1 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-none text-sm focus:outline-none focus:border-[#ddff5c]/30 transition-all placeholder:text-white/20"
                    />
                    {options.length > 3 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#ddff5c] transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Option
                </button>
              )}
            </div>

            {/* Options Preview */}
            {options.filter(o => o.trim()).length >= 2 && (
              <div className="bg-white/[0.03] border border-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Preview</p>
                <div className="flex flex-wrap items-center gap-2">
                  {options.filter(o => o.trim()).map((opt, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 text-xs font-black uppercase tracking-wider">
                      {opt.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Odds Display Info Card */}
        <div className="bg-white/[0.03] border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-base text-[#ddff5c]">bar_chart</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ddff5c]">Odds Display</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed">
            {outcomeType === 'BINARY' 
              ? 'Binary odds use the platform probability engine and update after each trade. Example: "65% Yes / 35% No."'
              : 'Each option shows a normalized probability from the platform probability engine, not just a raw share of bets.'
            }
          </p>
        </div>

        {/* Resolution DateTime */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">
            Resolution Date & Time <span className="text-[#ddff5c]">*</span>
          </label>
          <DatetimeSelector
            value={resolutionDateTime}
            onChange={(e) => {
              setResolutionDateTime(e.target.value);
            }}
            className='w-full'
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[#ddff5c] text-[#0b0f0e] text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
        >
          {isSubmitting ? 'Creating Market...' : 'Create Market'}
        </button>
      </form>
    </div>
  );
}

export default Create;
