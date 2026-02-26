const { useState, useEffect, useMemo } = React;

// Constants & Initial State
const INITIAL_PLAYERS = {
    ms: Array(4).fill().map((_, i) => ({ id: `ms${i + 1}`, name: '', rank: i + 1 })),
    mdMen: Array(4).fill().map((_, i) => ({ id: `mdM${i + 1}`, name: '', rank: i + 1 })),
    mdWomen: Array(4).fill().map((_, i) => ({ id: `mdW${i + 1}`, name: '', rank: i + 1 })),
};

const INITIAL_MATCHES = {
    // Mixed Doubles
    md_sf1: { id: 'md_sf1', type: 'md', round: 'sf', name: 'Bán kết 1 (Đôi Nam-Nữ)', team1: null, team2: null, scores: [], winner: null, loser: null },
    md_sf2: { id: 'md_sf2', type: 'md', round: 'sf', name: 'Bán kết 2 (Đôi Nam-Nữ)', team1: null, team2: null, scores: [], winner: null, loser: null },
    md_final: { id: 'md_final', type: 'md', round: 'final', name: 'Chung kết (Đôi Nam-Nữ)', team1: null, team2: null, scores: [], winner: null, loser: null },
    md_third: { id: 'md_third', type: 'md', round: 'third', name: 'Tranh Hạng 3 (Đôi Nam-Nữ)', team1: null, team2: null, scores: [], winner: null, loser: null },
    // Men's Singles
    ms_sf1: { id: 'ms_sf1', type: 'ms', round: 'sf', name: 'Bán kết 1 (Đơn Nam)', team1: null, team2: null, scores: [], winner: null, loser: null },
    ms_sf2: { id: 'ms_sf2', type: 'ms', round: 'sf', name: 'Bán kết 2 (Đơn Nam)', team1: null, team2: null, scores: [], winner: null, loser: null },
    ms_final: { id: 'ms_final', type: 'ms', round: 'final', name: 'Chung kết (Đơn Nam)', team1: null, team2: null, scores: [], winner: null, loser: null },
    ms_third: { id: 'ms_third', type: 'ms', round: 'third', name: 'Tranh Hạng 3 (Đơn Nam)', team1: null, team2: null, scores: [], winner: null, loser: null },
};

const SCHEDULE_GRID = [
    { slot: 1, name: 'Khung giờ 1', court1: 'md_sf1', court2: 'md_sf2' },
    { slot: 2, name: 'Khung giờ 2', court1: 'ms_sf1', court2: 'ms_sf2' },
    { slot: 3, name: 'Khung giờ 3', court1: 'md_final', court2: 'md_third' },
    { slot: 4, name: 'Khung giờ 4', court1: 'ms_final', court2: 'ms_third' }
];

// --- Helper Functions ---
// Score Validation
const validateScore = (score1, score2) => {
    const s1 = parseInt(score1);
    const s2 = parseInt(score2);
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) return { valid: false, msg: 'Điểm không hợp lệ' };
    if (s1 === 30 || s2 === 30) {
        if (Math.abs(s1 - s2) !== 1 && Math.abs(s1 - s2) !== 2) return { valid: false, msg: 'Chạm 30 điểm thì cách biệt phải là 1 (hoặc điểm kia 28)' };
        return { valid: true, msg: 'Hợp lệ', winner: s1 === 30 ? 1 : 2 };
    }
    if (s1 >= 21 || s2 >= 21) {
        const diff = Math.abs(s1 - s2);
        if (diff < 2) return { valid: false, msg: 'Phải cách biệt ít nhất 2 điểm (hoặc đánh tới 30)' };
        if ((s1 > 21 || s2 > 21) && diff > 2) return { valid: false, msg: 'Cách biệt 2 điểm là trận đã kết thúc, không nên có tỉ số xa hơn' };
        return { valid: true, msg: 'Hợp lệ', winner: s1 > s2 ? 1 : 2 };
    }
    return { valid: false, msg: 'Chưa đội nào đạt đủ điều kiện thắng (21 điểm)' };
};

// --- Custom Components extracted outside App ---
const MatchScoreCard = ({ matchId, match, saveMatchScore }) => {
    const [inputScores, setInputScores] = useState([
        { s1: '', s2: '' }, { s1: '', s2: '' }, { s1: '', s2: '' }
    ]);

    useEffect(() => {
        if (match?.scores?.length > 0) {
            const newS = [{ s1: '', s2: '' }, { s1: '', s2: '' }, { s1: '', s2: '' }];
            match.scores.forEach((s, i) => {
                newS[i] = { s1: s.s1.toString(), s2: s.s2.toString() };
            });
            setInputScores(newS);
        }
    }, [match?.scores]);

    if (!match?.team1 || !match?.team2) {
        return (
            <div className="glass-card p-4 opacity-50 flex items-center justify-center h-full">
                <span className="text-sm italic text-gray-400">{match?.name} - Chờ xác định đối thủ</span>
            </div>
        );
    }

    const handleSetScoreChange = (setIdx, playerIdx, val) => {
        const newS = [...inputScores];
        newS[setIdx][playerIdx] = val;
        setInputScores(newS);
    };

    return (
        <div className={`glass-card p-5 relative overflow-hidden ${match.winner ? 'border-success/50 bg-success/5' : ''}`}>
            {match.winner && <div className="absolute top-0 right-0 bg-success text-white text-xs px-2 py-1 rounded-bl-lg font-bold">ĐÃ KẾT THÚC</div>}
            <h4 className="font-bold text-accent mb-4 border-b border-glass-border pb-2">{match.name}</h4>
            <div className="grid grid-cols-[1fr_auto] gap-4 mb-2 items-center">
                <div className={`font-semibold ${match.winner?.id === match.team1.id ? 'text-success' : ''}`}>
                    {match.team1.name} {match.winner?.id === match.team1.id ? '👑' : ''}
                </div>
                <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                        <input key={`t1-s${i}`} type="number" className="score-input" value={inputScores[i].s1} onChange={(e) => handleSetScoreChange(i, 's1', e.target.value)} disabled={!!match.winner} placeholder="-" />
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <div className={`font-semibold ${match.winner?.id === match.team2.id ? 'text-success' : ''}`}>
                    {match.team2.name} {match.winner?.id === match.team2.id ? '👑' : ''}
                </div>
                <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                        <input key={`t2-s${i}`} type="number" className="score-input" value={inputScores[i].s2} onChange={(e) => handleSetScoreChange(i, 's2', e.target.value)} disabled={!!match.winner} placeholder="-" />
                    ))}
                </div>
            </div>
            {!match.winner && (
                <div className="mt-4 flex justify-end">
                    <button className="btn btn-success text-sm py-1" onClick={() => saveMatchScore(matchId, inputScores)}>
                        Lưu Kết Quả & Kiểm tra
                    </button>
                </div>
            )}
            <div className="mt-2 text-xs text-text-muted text-right">
                (Gợi ý: Nhập điểm từng set, vd: 21-19. Lưu để tự động chốt thắng thua)
            </div>
        </div>
    );
};

const MatchBox = ({ match }) => (
    <div className="glass-card w-48 text-sm relative match-box">
        <div className="bg-slate-800/80 p-1 text-center text-xs font-bold border-b border-glass-border rounded-t-lg">{match?.name}</div>
        <div className={`p-2 border-b border-glass-border/30 ${match?.winner?.id === match?.team1?.id ? 'bg-success/20 font-bold' : ''}`}>
            <div className="flex justify-between items-center">
                <span className="truncate pr-2">{match?.team1?.name || '-'}</span>
                <span className="font-mono">{match?.scores?.map(s => s.s1).join(' ')}</span>
            </div>
        </div>
        <div className={`p-2 ${match?.winner?.id === match?.team2?.id ? 'bg-success/20 font-bold' : ''}`}>
            <div className="flex justify-between items-center">
                <span className="truncate pr-2">{match?.team2?.name || '-'}</span>
                <span className="font-mono">{match?.scores?.map(s => s.s2).join(' ')}</span>
            </div>
        </div>
    </div>
);

const TournamentBracket = ({ type, matches }) => {
    const sf1 = matches[`${type}_sf1`];
    const sf2 = matches[`${type}_sf2`];
    const final = matches[`${type}_final`];
    const third = matches[`${type}_third`];

    return (
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center my-8 scale-90 md:scale-100 origin-top">
            {/* SF Column */}
            <div className="flex flex-col gap-12 relative">
                <MatchBox match={sf1} />
                <MatchBox match={sf2} />
                {/* Lines */}
                <div className="hidden md:block absolute right-[-2rem] top-[25%] w-8 h-[50%] border-r-2 border-t-2 border-b-2 border-glass-border rounded-r-lg z-0"></div>
            </div>
            {/* Final Column */}
            <div className="flex flex-col gap-4 relative z-10">
                <div className="hidden md:block absolute left-[-2rem] top-1/2 w-8 h-1 outline-none border-t-2 border-glass-border"></div>
                <div className="text-center">
                    <div className="text-yellow-400 font-bold mb-2 flex items-center justify-center gap-1">
                        Chung Kết
                    </div>
                    <MatchBox match={final} />
                </div>
                <div className="text-center mt-6">
                    <div className="text-slate-400 font-bold mb-2">Tranh Hạng 3</div>
                    <MatchBox match={third} />
                </div>
            </div>
        </div>
    );
};

const SetupTab = ({ players, mdTeams, msDrawDone, mdDrawDone, handlePlayerCountChange, handlePlayerChange, generateMdTeams, performDraw }) => (
    <div className="space-y-8 animate-fade-in">
        {/* Mixed Doubles Setup */}
        <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">1. Cài đặt Giải Đôi Nam-Nữ (Mixed Doubles)</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Danh sách Nam</h3>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-text-muted">Số lượng:</label>
                            <input type="number" min="1" className="glass-input w-16 text-center py-1" value={players?.mdMen?.length || 0} onChange={(e) => handlePlayerCountChange('mdMen', e.target.value)} />
                        </div>
                    </div>
                    {players.mdMen.map((p, i) => (
                        <div key={p.id} className="flex gap-2 mb-2">
                            <input className="glass-input flex-1" placeholder={`Tên Nam ${i + 1}`} value={p.name} onChange={(e) => handlePlayerChange('mdMen', i, 'name', e.target.value)} />
                            <input className="glass-input w-24 text-center" type="number" min="1" placeholder="Rank" value={p.rank} onChange={(e) => handlePlayerChange('mdMen', i, 'rank', e.target.value)} />
                        </div>
                    ))}
                </div>
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Danh sách Nữ</h3>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-text-muted">Số lượng:</label>
                            <input type="number" min="1" className="glass-input w-16 text-center py-1" value={players?.mdWomen?.length || 0} onChange={(e) => handlePlayerCountChange('mdWomen', e.target.value)} />
                        </div>
                    </div>
                    {players.mdWomen.map((p, i) => (
                        <div key={p.id} className="flex gap-2 mb-2">
                            <input className="glass-input flex-1" placeholder={`Tên Nữ ${i + 1}`} value={p.name} onChange={(e) => handlePlayerChange('mdWomen', i, 'name', e.target.value)} />
                            <input className="glass-input w-24 text-center" type="number" min="1" placeholder="Rank" value={p.rank} onChange={(e) => handlePlayerChange('mdWomen', i, 'rank', e.target.value)} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 items-center">
                <button className="btn btn-primary" onClick={generateMdTeams}>Tạo đội tự động (Cân sức)</button>
                <span className="text-sm text-text-muted">Quy tắc: Nam rank 1 + Nữ rank 4, Nam rank 2 + Nữ rank 3...</span>
            </div>

            {mdTeams.length > 0 && (
                <div className="mt-6 p-4 glass-card">
                    <h3 className="text-lg font-semibold mb-3">Các đội đã tạo:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {mdTeams.map(t => (
                            <div key={t.id} className="bg-slate-800/80 p-3 rounded-lg border border-slate-600/50">
                                <div className="font-bold text-accent">{t.name}</div>
                                <div className="text-xs text-text-muted mt-1">
                                    Rank: Nam {t.man.rank} + Nữ {t.woman.rank}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex gap-3">
                        <button className="btn btn-success" onClick={() => performDraw('md', false)}>Bốc thăm ngẫu nhiên</button>
                        <button className="btn btn-primary" onClick={() => performDraw('md', true)}>Bốc thăm hạt giống (1v4, 2v3)</button>
                    </div>
                    {mdDrawDone && <span className="text-success ml-3 text-sm font-semibold">✓ Đã bốc thăm</span>}
                </div>
            )}
        </div>

        {/* Men's Singles Setup */}
        <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">2. Cài đặt Giải Đơn Nam (Men's Singles)</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-3">Danh sách VĐV</h3>
                    {players.ms.map((p, i) => (
                        <div key={p.id} className="flex gap-2 mb-2">
                            <input className="glass-input flex-1" placeholder={`Tên VĐV Đơn Nam ${i + 1}`} value={p.name} onChange={(e) => handlePlayerChange('ms', i, 'name', e.target.value)} />
                            <input className="glass-input w-24 text-center" type="number" min="1" max="4" placeholder="Rank" value={p.rank} onChange={(e) => handlePlayerChange('ms', i, 'rank', e.target.value)} />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col justify-center gap-3">
                    <button className="btn btn-success" onClick={() => performDraw('ms', false)}>Bốc thăm ngẫu nhiên</button>
                    <button className="btn btn-primary" onClick={() => performDraw('ms', true)}>Bốc thăm hạt giống (1v4, 2v3)</button>
                    {msDrawDone && <div className="text-success mt-2 font-semibold">✓ Đã phân nhánh xong</div>}
                </div>
            </div>
        </div>
    </div>
);

const ScheduleTab = ({ matches }) => (
    <div className="glass-panel p-6 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-primary text-center">Lịch Thi Đấu Cố Định (2 Sân / 4 Slot)</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-glass-border">
                        <th className="p-4 font-semibold text-text-muted">Lượt Thứ</th>
                        <th className="p-4 font-semibold text-accent text-center">Court 1</th>
                        <th className="p-4 font-semibold text-success text-center">Court 2</th>
                    </tr>
                </thead>
                <tbody>
                    {SCHEDULE_GRID.map((row, i) => {
                        const m1 = matches[row.court1];
                        const m2 = matches[row.court2];
                        return (
                            <tr key={i} className="border-b border-glass-border/50 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold">Slot {row.slot}</td>
                                <td className="p-4 text-center border-l border-glass-border/30">
                                    <div className="text-sm text-text-muted font-medium mb-1">{m1?.name}</div>
                                    {m1?.team1 && m1?.team2 ? (
                                        <div className="font-semibold">{m1.team1.name} <br /><span className="text-danger text-xs italic">vs</span><br /> {m1.team2.name}</div>
                                    ) : <span className="text-xs text-slate-500 italic">Chưa xác định</span>}
                                </td>
                                <td className="p-4 text-center border-l border-glass-border/30">
                                    <div className="text-sm text-text-muted font-medium mb-1">{m2?.name}</div>
                                    {m2?.team1 && m2?.team2 ? (
                                        <div className="font-semibold">{m2.team1.name} <br /><span className="text-danger text-xs italic">vs</span><br /> {m2.team2.name}</div>
                                    ) : <span className="text-xs text-slate-500 italic">Chưa xác định</span>}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    </div>
);

const ScoringTab = ({ matches, saveMatchScore }) => (
    <div className="space-y-8 animate-fade-in">
        <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Nhập Kết Quả - Giải Đôi Nam-Nữ</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <MatchScoreCard matchId="md_sf1" match={matches.md_sf1} saveMatchScore={saveMatchScore} />
                <MatchScoreCard matchId="md_sf2" match={matches.md_sf2} saveMatchScore={saveMatchScore} />
                <MatchScoreCard matchId="md_final" match={matches.md_final} saveMatchScore={saveMatchScore} />
                <MatchScoreCard matchId="md_third" match={matches.md_third} saveMatchScore={saveMatchScore} />
            </div>
        </div>
        <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Nhập Kết Quả - Giải Đơn Nam</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <MatchScoreCard matchId="ms_sf1" match={matches.ms_sf1} saveMatchScore={saveMatchScore} />
                <MatchScoreCard matchId="ms_sf2" match={matches.ms_sf2} saveMatchScore={saveMatchScore} />
                <MatchScoreCard matchId="ms_final" match={matches.ms_final} saveMatchScore={saveMatchScore} />
                <MatchScoreCard matchId="ms_third" match={matches.ms_third} saveMatchScore={saveMatchScore} />
            </div>
        </div>
    </div>
);

const PublicBoardTab = ({ viewMode, matches }) => (
    <div className="animate-fade-in space-y-8">
        {viewMode === 'public' && (
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
                    LIVE: GIẢI VÔ ĐỊCH CẦU LÔNG
                </h1>
                <p className="text-text-muted">Bảng điểm và sơ đồ trận đấu được cập nhật trực tiếp</p>
            </div>
        )}
        <div className="glass-panel p-6 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">🏆 Nhánh Đấu Đôi Nam-Nữ</h2>
            <TournamentBracket type="md" matches={matches} />
        </div>
        <div className="glass-panel p-6 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">🏆 Nhánh Đấu Đơn Nam</h2>
            <TournamentBracket type="ms" matches={matches} />
        </div>
        <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold mb-4">Lịch Thi Đấu Hôm Nay</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SCHEDULE_GRID.map((row, i) => (
                    <div key={i} className="glass-card p-4 flex flex-col justify-center">
                        <div className="font-bold text-lg mb-2 border-b border-glass-border text-primary">{row.name}</div>
                        <div className="flex justify-between py-1 border-b border-glass-border/30">
                            <span className="text-sm font-semibold">Cout 1: {matches[row.court1]?.name}</span>
                            <span className="text-sm text-text-muted">
                                {matches[row.court1]?.team1?.name} vs {matches[row.court1]?.team2?.name}
                            </span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-sm font-semibold text-success">Cout 2: {matches[row.court2]?.name}</span>
                            <span className="text-sm text-text-muted">
                                {matches[row.court2]?.team1?.name} vs {matches[row.court2]?.team2?.name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const App = () => {
    const [viewMode, setViewMode] = useState('admin');
    const [activeTab, setActiveTab] = useState('setup');

    const [players, setPlayers] = useState(INITIAL_PLAYERS);
    const [mdTeams, setMdTeams] = useState([]);
    const [msDrawDone, setMsDrawDone] = useState(false);
    const [mdDrawDone, setMdDrawDone] = useState(false);
    const [matches, setMatches] = useState(INITIAL_MATCHES);

    const generateTxtReport = (currentPlayers, currentMdTeams, currentMatches) => {
        let txt = "BÁO CÁO KẾT QUẢ GIẢI ĐẤU CẦU LÔNG\n";
        txt += "=================================\n\n";

        txt += "=== 1. CÁC ĐỘI ĐÔI NAM-NỮ ===\n";
        if (currentMdTeams.length > 0) {
            currentMdTeams.forEach(t => {
                txt += `${t.name} (Nam: Rank ${t.man.rank}, Nữ: Rank ${t.woman.rank})\n`;
            });
        } else {
            txt += "Chưa có đội.\n";
        }
        txt += "\n";

        txt += "=== 2. CÁC VĐV ĐƠN NAM ===\n";
        const msParticipants = currentPlayers.ms.filter(p => p.name);
        if (msParticipants.length > 0) {
            msParticipants.forEach((p, i) => {
                txt += `${i + 1}. ${p.name} (Rank ${p.rank})\n`;
            });
        } else {
            txt += "Chưa đăng ký đủ VĐV.\n";
        }
        txt += "\n";

        txt += "=== 3. KẾT QUẢ CÁC TRẬN ĐẤU ===\n";
        const writeRound = (title, matchTypes) => {
            txt += `[${title}]\n`;
            matchTypes.forEach(k => {
                const m = currentMatches[k];
                txt += ` - ${m?.name}: `;
                if (!m?.team1 || !m?.team2) {
                    txt += "Chưa có đối thủ\n";
                } else {
                    txt += `${m.team1.name} VS ${m.team2.name} | `;
                    if (m.scores && m.scores.length > 0) {
                        txt += "Tỉ số: " + m.scores.map(s => `${s.s1}-${s.s2}`).join(' / ');
                        if (m.winner) txt += ` ==> THẮNG: ${m.winner.name}`;
                    } else {
                        txt += "Chưa ghi điểm";
                    }
                    txt += "\n";
                }
            });
            txt += "\n";
        };

        writeRound("GIẢI ĐÔI NAM-NỮ", ['md_sf1', 'md_sf2', 'md_third', 'md_final']);
        writeRound("GIẢI ĐƠN NAM", ['ms_sf1', 'ms_sf2', 'ms_third', 'ms_final']);
        return txt;
    };

    const autoSaveToBackend = async (currentPlayers, currentMdTeams, currentMsDrawDone, currentMdDrawDone, currentMatches) => {
        try {
            const state = {
                players: currentPlayers,
                mdTeams: currentMdTeams,
                msDrawDone: currentMsDrawDone,
                mdDrawDone: currentMdDrawDone,
                matches: currentMatches
            };
            const txtReport = generateTxtReport(currentPlayers, currentMdTeams, currentMatches);

            await fetch('http://localhost:3001/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state, txtReport })
            });
        } catch (e) {
            console.error("Lỗi khi kết nối Node server để lưu tự động:", e);
        }
    };

    useEffect(() => {
        fetch('http://localhost:3001/api/data')
            .then(res => res.json())
            .then(parsed => {
                if (parsed) {
                    setPlayers(parsed.players || INITIAL_PLAYERS);
                    setMdTeams(parsed.mdTeams || []);
                    setMsDrawDone(parsed.msDrawDone || false);
                    setMdDrawDone(parsed.mdDrawDone || false);
                    setMatches(parsed.matches || INITIAL_MATCHES);
                }
            })
            .catch(e => console.warn("Không tìm thấy Local Node Server, Load dữ liệu trống."));
    }, []);

    const timerRef = React.useRef(null);
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            autoSaveToBackend(players, mdTeams, msDrawDone, mdDrawDone, matches);
        }, 1500);
        return () => clearTimeout(timerRef.current);
    }, [players, mdTeams, msDrawDone, mdDrawDone, matches]);

    const handlePlayerCountChange = (category, count) => {
        const newCount = parseInt(count) || 0;
        if (newCount < 1) return;

        const newPlayers = { ...players };
        const currentList = newPlayers[category];

        if (newCount > currentList.length) {
            const toAdd = newCount - currentList.length;
            const newItems = Array(toAdd).fill().map((_, i) => ({
                id: `${category}_new_${Date.now()}_${i}`,
                name: '',
                rank: currentList.length + i + 1
            }));
            newPlayers[category] = [...currentList, ...newItems];
        } else if (newCount < currentList.length) {
            newPlayers[category] = currentList.slice(0, newCount);
        }

        setPlayers(newPlayers);
    };

    const handlePlayerChange = (category, index, field, value) => {
        const newPlayers = { ...players };
        newPlayers[category][index][field] = field === 'rank' ? parseInt(value) || 0 : value;
        setPlayers(newPlayers);
    };

    const generateMdTeams = () => {
        const sortedMen = [...players.mdMen].sort((a, b) => a.rank - b.rank);
        const sortedWomen = [...players.mdWomen].sort((a, b) => a.rank - b.rank);

        if (sortedMen.some(m => !m.name) || sortedWomen.some(w => !w.name)) {
            alert('Vui lòng nhập đầy đủ tên cho các VĐV Nam và Nữ trước khi xếp đội.');
            return;
        }

        const teams = [];
        const numTeams = Math.min(sortedMen.length, sortedWomen.length);
        for (let i = 0; i < numTeams; i++) {
            const man = sortedMen[i];
            const woman = sortedWomen[sortedWomen.length - 1 - i];
            teams.push({
                id: `team${i + 1}`,
                name: `Đội ${i + 1}: ${man.name} + ${woman.name}`,
                man,
                woman,
                seedRank: i + 1
            });
        }
        setMdTeams(teams);
        setMdDrawDone(false);
    };

    const performDraw = (type, isSeeded) => {
        const newMatches = { ...matches };
        let participants = [];

        if (type === 'ms') {
            participants = [...players.ms];
            if (participants.some(p => !p.name)) {
                alert('Vui lòng nhập đủ VĐV Đơn Nam');
                return;
            }
            if (isSeeded) {
                participants.sort((a, b) => a.rank - b.rank);
                newMatches.ms_sf1.team1 = participants[0];
                newMatches.ms_sf1.team2 = participants[participants.length - 1];
                newMatches.ms_sf2.team1 = participants[1];
                newMatches.ms_sf2.team2 = participants[2] || participants[1];
            } else {
                for (let i = participants.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [participants[i], participants[j]] = [participants[j], participants[i]];
                }
                newMatches.ms_sf1.team1 = participants[0];
                newMatches.ms_sf1.team2 = participants[1];
                newMatches.ms_sf2.team1 = participants[2];
                newMatches.ms_sf2.team2 = participants[3];
            }

            newMatches.ms_final.team1 = null; newMatches.ms_final.team2 = null;
            newMatches.ms_third.team1 = null; newMatches.ms_third.team2 = null;
            setMsDrawDone(true);
        } else if (type === 'md') {
            if (mdTeams.length < 4) {
                alert('Vui lòng tạo ít nhất 4 đội Đôi Nam-Nữ để bốc thăm');
                return;
            }
            participants = mdTeams.slice(0, 4);
            if (isSeeded) {
                newMatches.md_sf1.team1 = participants[0];
                newMatches.md_sf1.team2 = participants[3];
                newMatches.md_sf2.team1 = participants[1];
                newMatches.md_sf2.team2 = participants[2];
            } else {
                for (let i = participants.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [participants[i], participants[j]] = [participants[j], participants[i]];
                }
                newMatches.md_sf1.team1 = participants[0];
                newMatches.md_sf1.team2 = participants[1];
                newMatches.md_sf2.team1 = participants[2];
                newMatches.md_sf2.team2 = participants[3];
            }

            newMatches.md_final.team1 = null; newMatches.md_final.team2 = null;
            newMatches.md_third.team1 = null; newMatches.md_third.team2 = null;
            setMdDrawDone(true);
        }

        Object.keys(newMatches).forEach(k => {
            if (newMatches[k].type === type) {
                newMatches[k].scores = [];
                newMatches[k].winner = null;
                newMatches[k].loser = null;
            }
        });

        setMatches(newMatches);
    };

    const resetAll = () => {
        if (confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu và làm lại từ đầu?')) {
            setPlayers(INITIAL_PLAYERS);
            setMdTeams([]);
            setMatches(INITIAL_MATCHES);
            setMsDrawDone(false);
            setMdDrawDone(false);
        }
    };

    const exportData = () => {
        const data = { players, mdTeams, msDrawDone, mdDrawDone, matches };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'badminton-tournament-data.json';
        a.click();
    };

    const importData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (parsed.players) setPlayers(parsed.players);
                    if (parsed.mdTeams) setMdTeams(parsed.mdTeams);
                    if (parsed.matches) setMatches(parsed.matches);
                    if (parsed.msDrawDone !== undefined) setMsDrawDone(parsed.msDrawDone);
                    if (parsed.mdDrawDone !== undefined) setMdDrawDone(parsed.mdDrawDone);
                    alert("Đã khôi phục dữ liệu Giải Đấu thành công!");
                } catch (err) {
                    alert("Lỗi parse file JSON. Vui lòng kiểm tra lại file của bạn.");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const saveMatchScore = (matchId, newScores) => {
        const newMatches = { ...matches };
        const match = newMatches[matchId];

        if (!match.team1 || !match.team2) return;

        let t1Wins = 0;
        let t2Wins = 0;
        const formattedScores = [];

        for (let i = 0; i < 3; i++) {
            const s = newScores[i];
            if (!s || s.s1 === '' || s.s2 === '') break;

            const val = validateScore(s.s1, s.s2);
            if (!val.valid) {
                alert(`Lỗi Set ${i + 1}: ${val.msg}`);
                return;
            }
            if (val.winner === 1) t1Wins++;
            if (val.winner === 2) t2Wins++;

            formattedScores.push({ s1: parseInt(s.s1), s2: parseInt(s.s2), winner: val.winner });

            if (t1Wins === 2 || t2Wins === 2) break;
        }

        match.scores = formattedScores;

        if (t1Wins === 2 || t2Wins === 2) {
            match.winner = t1Wins === 2 ? match.team1 : match.team2;
            match.loser = t1Wins === 2 ? match.team2 : match.team1;

            if (match.round === 'sf') {
                const type = match.type;
                const otherSfId = matchId.endsWith('1') ? `${type}_sf2` : `${type}_sf1`;
                const otherSf = newMatches[otherSfId];

                if (match.winner && otherSf.winner) {
                    newMatches[`${type}_final`].team1 = matchId.endsWith('1') ? match.winner : otherSf.winner;
                    newMatches[`${type}_final`].team2 = matchId.endsWith('1') ? otherSf.winner : match.winner;

                    newMatches[`${type}_third`].team1 = matchId.endsWith('1') ? match.loser : otherSf.loser;
                    newMatches[`${type}_third`].team2 = matchId.endsWith('1') ? otherSf.loser : match.loser;

                    newMatches[`${type}_final`].scores = [];
                    newMatches[`${type}_final`].winner = null;
                    newMatches[`${type}_final`].loser = null;
                    newMatches[`${type}_third`].scores = [];
                    newMatches[`${type}_third`].winner = null;
                    newMatches[`${type}_third`].loser = null;
                }
            }
        } else {
            match.winner = null;
            match.loser = null;
        }

        setMatches(newMatches);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-glow">
                        🏸
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Badminton Manager</h1>
                        <p className="text-sm text-text-muted">Giải Đấu Cầu Lông 4 Đội / Nhánh</p>
                    </div>
                </div>

                <div className="flex gap-3 bg-slate-800/50 p-2 rounded-lg border border-glass-border flex-wrap">
                    <button className={`btn text-sm ${viewMode === 'admin' ? 'bg-white/10 text-white' : 'btn-ghost'}`} onClick={() => setViewMode('admin')}>
                        ⚙️ Admin View
                    </button>
                    <button className={`btn text-sm ${viewMode === 'public' ? 'bg-white/10 text-white' : 'btn-ghost'}`} onClick={() => setViewMode('public')}>
                        📺 Public View
                    </button>
                    {viewMode === 'admin' && (
                        <>
                            <div className="w-px bg-glass-border mx-1"></div>
                            <span className="text-xs text-success flex items-center px-2 py-1 bg-success/10 rounded border border-success/30 font-semibold shadow-sm">
                                🟢 Tự động lưu file (Local Server)
                            </span>
                            <button className="btn btn-ghost text-sm" onClick={exportData} title="Lưu Backup JSON">⬇️ Tải JSON</button>
                            <button className="btn btn-ghost text-sm" onClick={importData} title="Khôi phục từ file JSON">⬆️ Nhập JSON</button>
                            <button className="btn btn-danger text-sm" onClick={resetAll} title="Làm mới hoàn toàn">🗑️ Xóa gốc</button>
                        </>
                    )}
                </div>
            </div>

            {viewMode === 'admin' && (
                <div className="flex border-b border-glass-border mb-8 overflow-x-auto scrollbar-hide">
                    <div className={`tab-btn whitespace-nowrap ${activeTab === 'setup' ? 'active' : ''}`} onClick={() => setActiveTab('setup')}>1. Đăng Ký & Bốc Thăm</div>
                    <div className={`tab-btn whitespace-nowrap ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>2. Lịch Thi Đấu Cố Định</div>
                    <div className={`tab-btn whitespace-nowrap ${activeTab === 'scoring' ? 'active' : ''}`} onClick={() => setActiveTab('scoring')}>3. Nhập Kết Quả (Scoring)</div>
                    <div className={`tab-btn whitespace-nowrap ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>4. Bảng Kết Quả (Bracket)</div>
                </div>
            )}

            <div className="min-h-[60vh]">
                {viewMode === 'public' ? (
                    <PublicBoardTab viewMode={viewMode} matches={matches} />
                ) : (
                    <>
                        {activeTab === 'setup' && <SetupTab players={players} mdTeams={mdTeams} msDrawDone={msDrawDone} mdDrawDone={mdDrawDone} handlePlayerCountChange={handlePlayerCountChange} handlePlayerChange={handlePlayerChange} generateMdTeams={generateMdTeams} performDraw={performDraw} />}
                        {activeTab === 'schedule' && <ScheduleTab matches={matches} />}
                        {activeTab === 'scoring' && <ScoringTab matches={matches} saveMatchScore={saveMatchScore} />}
                        {activeTab === 'board' && <PublicBoardTab viewMode={viewMode} matches={matches} />}
                    </>
                )}
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
