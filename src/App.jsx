import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Settings, 
  Trash2, 
  Clock, 
  LogOut,
  Users,
  LayoutDashboard,
  Lock,
  Mail,
  ChevronLeft,
  Info,
  CheckCircle
} from 'lucide-react';

// --- MOCK DATA MEJORADA ---

const INITIAL_STUDIOS = [
  { 
    id: 1, 
    name: 'Zen Yoga Studio', 
    description: 'Encuentra tu paz interior en nuestro santuario urbano.', 
    adminId: 101,
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=800',
    tags: ['Yoga', 'Meditación', 'Hatha'],
    rows: 4, // Filas del salón
    cols: 4  // Columnas del salón
  },
  { 
    id: 2, 
    name: 'Pilates Power House', 
    description: 'Fuerza, flexibilidad y control total de tu cuerpo.', 
    adminId: 102, 
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
    tags: ['Pilates', 'Reformer', 'Barre'],
    rows: 3,
    cols: 3
  },
];

const INITIAL_CLASSES = [
  { 
    id: 1, 
    studioId: 1, 
    name: 'Morning Hatha', 
    instructor: 'Ana Sofía',
    time: '08:00', 
    duration: 60, 
    cost: 2, 
    date: '2023-10-27',
    takenSeats: ['0-0', '0-1', '1-1'] // Coordenadas ocupadas (fila-columna)
  },
  { 
    id: 2, 
    studioId: 1, 
    name: 'Vinyasa Flow', 
    instructor: 'Carlos R.',
    time: '18:00', 
    duration: 60, 
    cost: 3, 
    date: '2023-10-27',
    takenSeats: ['0-0', '0-2', '2-2', '3-0'] 
  },
  { 
    id: 3, 
    studioId: 2, 
    name: 'Reformer Intro', 
    instructor: 'Mariana G.',
    time: '09:00', 
    duration: 50, 
    cost: 5, 
    date: '2023-10-27',
    takenSeats: [] 
  },
];

// ROLES: 1 = Super Admin, 2 = Admin, 3 = Usuario
const INITIAL_USERS = [
  { id: 1, name: 'Usuario Demo', email: 'user@stikiza.com', password: '123', role: 3, tokens: 25, bookings: [] },
  { id: 101, name: 'Dueño Yoga', email: 'admin@stikiza.com', password: '123', role: 2, studioId: 1 },
  { id: 999, name: 'Super Admin', email: 'super@stikiza.com', password: '123', role: 1 },
];

// --- COMPONENTES AUXILIARES ---

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-md p-4 mb-4 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = 'primary', className = "", disabled = false, type = "button" }) => {
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border-2 border-teal-600 text-teal-600 hover:bg-teal-50"
  };
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-semibold transition-all w-full flex justify-center items-center gap-2 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
    teal: 'bg-teal-100 text-teal-800',
    gray: 'bg-gray-100 text-gray-800'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

const InputGroup = ({ icon: Icon, ...props }) => (
  <div className="relative mb-3">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    <input 
      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" 
      {...props}
    />
  </div>
);

// --- APP PRINCIPAL ---

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [studios, setStudios] = useState(INITIAL_STUDIOS);
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [users, setUsers] = useState(INITIAL_USERS);
  
  // Navegación
  const [activeTab, setActiveTab] = useState('home'); // home, bookings, profile
  const [viewState, setViewState] = useState('list'); // list, studio_detail, seat_selection
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Estados del Formulario de Login
  const [isLoginView, setIsLoginView] = useState(true);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });

  // --- AUTH ---
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (isLoginView) {
      const foundUser = users.find(u => u.email === authForm.email && u.password === authForm.password);
      if (foundUser) {
        setCurrentUser(foundUser);
        setActiveTab('home');
        setViewState('list');
      } else {
        alert("Credenciales incorrectas.");
      }
    } else {
      if (!authForm.email || !authForm.password || !authForm.name) return;
      const newUser = {
        id: Date.now(),
        name: authForm.name,
        email: authForm.email,
        password: authForm.password,
        role: 3, 
        tokens: 0, 
        bookings: []
      };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setActiveTab('home');
      setViewState('list');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthForm({ email: '', password: '', name: '' });
    setViewState('list');
    setSelectedStudio(null);
    setSelectedClass(null);
  };

  // --- NAVEGACIÓN UX ---
  
  const goToStudio = (studio) => {
    setSelectedStudio(studio);
    setViewState('studio_detail');
  };

  const goToSeatSelection = (cls) => {
    setSelectedClass(cls);
    setSelectedSeat(null);
    setViewState('seat_selection');
  };

  const goBack = () => {
    if (viewState === 'seat_selection') {
      setViewState('studio_detail');
      setSelectedClass(null);
      setSelectedSeat(null);
    } else if (viewState === 'studio_detail') {
      setViewState('list');
      setSelectedStudio(null);
    }
  };

  // --- LÓGICA DE RESERVA ---

  const handleBookSeat = () => {
    if (!selectedSeat) return alert("Por favor selecciona un lugar.");
    if (currentUser.tokens < selectedClass.cost) return alert("Tokens insuficientes.");

    const seatId = `${selectedSeat.r}-${selectedSeat.c}`;
    
    // Actualizar usuario
    const updatedUser = { 
      ...currentUser, 
      tokens: currentUser.tokens - selectedClass.cost,
      bookings: [...currentUser.bookings, { 
        ...selectedClass, 
        bookingId: Date.now(), 
        seatLabel: seatId 
      }]
    };
    
    // Actualizar clase (ocupar asiento)
    const updatedClasses = classes.map(c => 
      c.id === selectedClass.id 
        ? { ...c, takenSeats: [...c.takenSeats, seatId] } 
        : c
    );

    setCurrentUser(updatedUser);
    setClasses(updatedClasses);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    
    alert("¡Reserva Confirmada!");
    setViewState('list'); // Volver al inicio
    setSelectedStudio(null);
    setSelectedClass(null);
    setSelectedSeat(null);
  };

  const cancelBooking = (bookingId, classCost, classId, seatLabel) => {
    const updatedUser = {
      ...currentUser,
      tokens: currentUser.tokens + classCost,
      bookings: currentUser.bookings.filter(b => b.bookingId !== bookingId)
    };

    const updatedClasses = classes.map(c => 
      c.id === classId 
        ? { ...c, takenSeats: c.takenSeats.filter(s => s !== seatLabel) } // Liberar asiento
        : c
    );

    setCurrentUser(updatedUser);
    setClasses(updatedClasses);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    alert("Reserva cancelada.");
  };

  const buyTokens = (amount) => {
    const updatedUser = { ...currentUser, tokens: currentUser.tokens + amount };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    alert(`¡Has comprado ${amount} tokens!`);
  };

  // --- RENDERIZADO DEL MAPA DE ASIENTOS ---
  const renderSeatMap = () => {
    if (!selectedStudio || !selectedClass) return null;
    
    const rows = selectedStudio.rows;
    const cols = selectedStudio.cols;
    const grid = [];

    for (let r = 0; r < rows; r++) {
      const rowCells = [];
      for (let c = 0; c < cols; c++) {
        const seatId = `${r}-${c}`;
        const isTaken = selectedClass.takenSeats.includes(seatId);
        const isSelected = selectedSeat?.r === r && selectedSeat?.c === c;

        rowCells.push(
          <button
            key={seatId}
            disabled={isTaken}
            onClick={() => setSelectedSeat({ r, c })}
            className={`
              w-10 h-10 rounded-lg m-1 text-xs font-bold transition-all
              flex items-center justify-center
              ${isTaken 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : isSelected 
                  ? 'bg-teal-600 text-white shadow-lg scale-110 ring-2 ring-teal-300' 
                  : 'bg-white border-2 border-teal-100 text-teal-700 hover:border-teal-500'}
            `}
          >
            {isTaken ? 'X' : `${r+1}${String.fromCharCode(65+c)}`}
          </button>
        );
      }
      grid.push(<div key={r} className="flex justify-center">{rowCells}</div>);
    }
    return (
      <div className="bg-gray-100 p-4 rounded-xl mb-4 overflow-x-auto">
        <div className="w-full text-center text-xs text-gray-400 mb-2 font-mono">PANTALLA / INSTRUCTOR</div>
        <div className="w-full h-1 bg-gray-300 mb-4 rounded-full"></div>
        {grid}
        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-600">
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-teal-100 rounded"></div> Libre</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-teal-600 rounded"></div> Tu lugar</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-300 rounded"></div> Ocupado</div>
        </div>
      </div>
    );
  };

  // --- VISTA ADMIN (Simplificada para mantener el enfoque en Usuario) ---
  const addClass = (e) => {
    e.preventDefault();
    alert("Funcionalidad admin simplificada para demo.");
  };

  // --- LOGIN SCREEN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 to-emerald-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md py-8 px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-teal-800 mb-1">Stikiza</h1>
            <p className="text-gray-500 text-sm">Tu acceso a estudios de bienestar</p>
          </div>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginView && (
              <InputGroup icon={User} type="text" placeholder="Nombre Completo" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
            )}
            <InputGroup icon={Mail} type="email" placeholder="Correo electrónico" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
            <InputGroup icon={Lock} type="password" placeholder="Contraseña" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            <Button type="submit">{isLoginView ? 'Iniciar Sesión' : 'Registrarse'}</Button>
          </form>
          <div className="mt-6 text-center text-sm">
             <button onClick={() => setIsLoginView(!isLoginView)} className="font-bold text-teal-600">
              {isLoginView ? 'Crear cuenta nueva' : 'Inicia Sesión aquí'}
            </button>
          </div>
          {/* Mock credentials hint */}
          <div className="mt-6 text-xs text-gray-400 text-center">User: user@stikiza.com (123)</div>
        </Card>
      </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* HEADER */}
      <div className="bg-white shadow-sm px-4 py-4 sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
           {viewState !== 'list' && activeTab === 'home' && (
             <button onClick={goBack} className="p-1 rounded-full hover:bg-gray-100">
               <ChevronLeft size={24} className="text-gray-600" />
             </button>
           )}
           <div>
            <h1 className="text-xl font-bold text-teal-700">Stikiza</h1>
            <p className="text-xs text-gray-400">Hola, {currentUser.name}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          {currentUser.role === 3 && (
            <div className="bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1 text-amber-800 font-bold text-sm">
              <span>🪙</span> {currentUser.tokens}
            </div>
          )}
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        
        {/* === ROL USUARIO === */}
        {currentUser.role === 3 && (
          <>
            {/* --- TAB EXPLORAR (HOME) --- */}
            {activeTab === 'home' && (
              <>
                {/* 1. LISTA DE ESTUDIOS */}
                {viewState === 'list' && (
                  <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-700">Explorar Estudios</h2>
                    {studios.map(studio => (
                      <div 
                        key={studio.id} 
                        onClick={() => goToStudio(studio)}
                        className="bg-white rounded-xl shadow-md overflow-hidden mb-5 cursor-pointer hover:shadow-xl transition-all group"
                      >
                        <div className="h-40 overflow-hidden relative">
                          <img src={studio.image} alt={studio.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                            <h3 className="text-white font-bold text-lg">{studio.name}</h3>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{studio.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {studio.tags.map(tag => (
                              <Badge key={tag} color="teal">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. DETALLE DEL ESTUDIO */}
                {viewState === 'studio_detail' && selectedStudio && (
                  <div>
                    <div className="mb-6">
                      <img src={selectedStudio.image} className="w-full h-48 object-cover rounded-xl shadow-md mb-4" />
                      <h2 className="text-2xl font-bold text-gray-800">{selectedStudio.name}</h2>
                      <p className="text-gray-500 text-sm mb-2">{selectedStudio.description}</p>
                      <div className="flex gap-2">
                         {selectedStudio.tags.map(tag => <Badge key={tag} color="gray">{tag}</Badge>)}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar size={18} /> Próximas Clases
                    </h3>
                    
                    {classes.filter(c => c.studioId === selectedStudio.id).map(cls => {
                      const capacity = selectedStudio.rows * selectedStudio.cols;
                      const occupied = cls.takenSeats.length;
                      const isFull = occupied >= capacity;
                      
                      return (
                        <Card key={cls.id} className="border-l-4 border-l-teal-500 flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800">{cls.name}</h4>
                            <p className="text-xs text-teal-600 font-medium mb-1">Instr: {cls.instructor}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><Clock size={14}/> {cls.time} ({cls.duration} min)</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                              Lugares: {capacity - occupied}
                            </span>
                            <Button 
                              onClick={() => goToSeatSelection(cls)} 
                              className="w-auto px-4 py-1 text-sm h-8"
                              disabled={isFull}
                              variant={isFull ? 'secondary' : 'primary'}
                            >
                              {isFull ? 'Lleno' : `${cls.cost} 🪙`}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* 3. SELECCIÓN DE ASIENTOS (MINIMAPA) */}
                {viewState === 'seat_selection' && selectedClass && (
                  <div>
                    <Card className="bg-teal-50 border border-teal-100 text-center mb-6">
                       <h3 className="text-teal-800 font-bold text-lg">{selectedClass.name}</h3>
                       <p className="text-teal-600 text-sm">con {selectedClass.instructor}</p>
                       <div className="mt-2 text-xs text-gray-500 flex justify-center gap-4">
                         <span>🕒 {selectedClass.time}</span>
                         <span>⏱️ {selectedClass.duration} min</span>
                       </div>
                    </Card>

                    <h3 className="font-bold text-gray-700 mb-2 text-center">Elige tu lugar</h3>
                    <p className="text-xs text-gray-400 text-center mb-4">La distribución puede variar ligeramente en el estudio.</p>
                    
                    {renderSeatMap()}

                    <div className="mt-8">
                       <div className="flex justify-between items-center mb-4 px-2">
                          <span className="text-gray-600">Total a pagar:</span>
                          <span className="text-xl font-bold text-teal-700">{selectedClass.cost} Tokens</span>
                       </div>
                       <Button 
                         onClick={handleBookSeat} 
                         disabled={!selectedSeat}
                         className="py-3 text-lg shadow-lg shadow-teal-200"
                       >
                         {selectedSeat ? `Confirmar Asiento ${selectedSeat.r+1}${String.fromCharCode(65+selectedSeat.c)}` : 'Selecciona un lugar'}
                       </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* --- OTRAS TABS (Bookings & Profile) --- */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-lg font-bold mb-4 text-gray-700">Mis Reservas</h2>
                {currentUser.bookings.map(booking => (
                  <Card key={booking.bookingId}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">{booking.name}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Confirmada</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                       <span>{booking.time}</span>
                       <span className="font-bold text-teal-600">Asiento: {booking.seatLabel ? `${parseInt(booking.seatLabel.split('-')[0])+1}${String.fromCharCode(65+parseInt(booking.seatLabel.split('-')[1]))}` : 'Gral'}</span>
                    </div>
                    <Button variant="danger" className="text-sm py-1" onClick={() => cancelBooking(booking.bookingId, booking.cost, booking.id, booking.seatLabel)}>
                      Cancelar (Reembolso)
                    </Button>
                  </Card>
                ))}
                {currentUser.bookings.length === 0 && <p className="text-center text-gray-400 py-10">Sin reservas activas</p>}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                 <h2 className="text-lg font-bold mb-4 text-gray-700">Mi Cartera</h2>
                 <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-sm opacity-80 mb-1">Tokens Disponibles</div>
                      <div className="text-4xl font-bold">🪙 {currentUser.tokens}</div>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-40px] opacity-20">
                      <CreditCard size={120} />
                    </div>
                 </div>
                 <h3 className="font-bold text-gray-600 mb-3">Recargar Saldo</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => buyTokens(5)} className="bg-white p-4 rounded-xl shadow border border-teal-100 hover:border-teal-500 transition-all text-center">
                      <div className="text-2xl mb-1">🪙 5</div>
                      <div className="font-bold text-gray-700">$50</div>
                    </button>
                    <button onClick={() => buyTokens(15)} className="bg-teal-50 p-4 rounded-xl shadow border border-teal-200 hover:border-teal-500 transition-all text-center">
                      <div className="text-2xl mb-1">🪙 15</div>
                      <div className="font-bold text-gray-700">$120</div>
                    </button>
                 </div>
              </div>
            )}
          </>
        )}

        {/* --- ROLES ADMIN (Vista Rápida) --- */}
        {(currentUser.role === 1 || currentUser.role === 2) && (
          <div className="text-center py-20">
             <Settings size={48} className="mx-auto text-gray-300 mb-4"/>
             <h2 className="text-xl font-bold text-gray-600">Vista de Administrador</h2>
             <p className="text-gray-400 max-w-xs mx-auto mt-2">Para esta demo de UX, enfócate en la experiencia del usuario (Rol 3).</p>
             <Button onClick={handleLogout} variant="outline" className="mt-6">Cerrar Sesión</Button>
          </div>
        )}

      </div>

      {/* NAVBAR */}
      {currentUser.role === 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 px-2 text-xs font-medium text-gray-500 z-20">
          <button onClick={() => {setActiveTab('home'); setViewState('list'); setSelectedStudio(null);}} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-teal-600' : ''}`}>
            <LayoutDashboard size={24} className="mb-1" /> Explorar
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`flex flex-col items-center ${activeTab === 'bookings' ? 'text-teal-600' : ''}`}>
            <Calendar size={24} className="mb-1" /> Agenda
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-teal-600' : ''}`}>
            <CreditCard size={24} className="mb-1" /> Tokens
          </button>
        </div>
      )}
    </div>
  );
}