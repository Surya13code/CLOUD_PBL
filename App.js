import React, { useState } from 'react';
import { Heart, User, Hospital, Activity, Clock, CheckCircle } from 'lucide-react';

const LifelineLedger = () => {
  const [view, setView] = useState('home');
  const [userType, setUserType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [donors] = useState([
    { id: 'D001', name: 'Sumeet Negi', email: 'sumeetnegi4429@gmail.com', password: 'sammy29', bloodType: 'O+' },
    { id: 'D002', name: 'Jatin Dasila', email: 'jatindasila4430@gmail.com', password: 'jatin30', bloodType: 'B+' }
  ]);

  const [hospitals] = useState([
    { id: 'H001', name: 'City General Hospital', email: 'city@hospital.com', password: 'hospital123' }
  ]);

  const [donations, setDonations] = useState([
    { 
      id: 'DON001', 
      donorId: 'D001', 
      donorName: 'Sumeet Negi',
      bloodType: 'O+',
      date: '2025-09-15', 
      quantity: '450ml',
      status: 'used',
      usedDate: '2025-09-20',
      usedBy: 'City General Hospital',
      purpose: 'Emergency Surgery'
    },
    { 
      id: 'DON002', 
      donorId: 'D001', 
      donorName: 'Sumeet Negi',
      bloodType: 'O+',
      date: '2025-10-01', 
      quantity: '450ml',
      status: 'available',
      usedDate: null,
      usedBy: null,
      purpose: null
    }
  ]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [donorId, setDonorId] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [quantity, setQuantity] = useState('450ml');
  const [donationId, setDonationId] = useState('');
  const [purpose, setPurpose] = useState('');

  const handleLogin = () => {
    if (userType === 'donor') {
      const donor = donors.find(d => d.email === loginEmail && d.password === loginPassword);
      if (donor) {
        setCurrentUser(donor);
        setView('donorDashboard');
      } else {
        alert('Invalid donor credentials!');
      }
    } else if (userType === 'hospital') {
      const hospital = hospitals.find(h => h.email === loginEmail && h.password === loginPassword);
      if (hospital) {
        setCurrentUser(hospital);
        setView('hospitalDashboard');
      } else {
        alert('Invalid hospital credentials!');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    setView('home');
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleAddDonation = () => {
    const donor = donors.find(d => d.id === donorId);
    if (!donor) {
      alert('Donor not found!');
      return;
    }

    const newDonation = {
      id: `DON${String(donations.length + 1).padStart(3, '0')}`,
      donorId: donor.id,
      donorName: donor.name,
      bloodType: bloodType,
      date: new Date().toISOString().split('T')[0],
      quantity: quantity,
      status: 'available',
      usedDate: null,
      usedBy: null,
      purpose: null
    };

    setDonations([...donations, newDonation]);
    setDonorId('');
    setBloodType('');
    setQuantity('450ml');
    alert('Donation recorded successfully!');
  };

  const handleUpdateUtilization = () => {
    const donationIndex = donations.findIndex(d => d.id === donationId);
    
    if (donationIndex === -1) {
      alert('Donation not found!');
      return;
    }

    const updatedDonations = [...donations];
    updatedDonations[donationIndex] = {
      ...updatedDonations[donationIndex],
      status: 'used',
      usedDate: new Date().toISOString().split('T')[0],
      usedBy: currentUser.name,
      purpose: purpose
    };

    setDonations(updatedDonations);
    setDonationId('');
    setPurpose('');
    alert('Utilization updated successfully! Donor will be notified.');
  };

  const getDonorDonations = () => {
    return donations.filter(d => d.donorId === currentUser?.id);
  };

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Heart className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Lifeline Ledger</h1>
            <p className="text-xl text-gray-600 mb-2">Tracking Every Drop</p>
            <p className="text-gray-500">Transparency in Blood Donation Management</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
                 onClick={() => { setUserType('donor'); setView('login'); }}>
              <User className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Donor Portal</h2>
              <p className="text-gray-600 mb-4">Track your blood donation journey and see the real impact</p>
              <div className="bg-red-500 text-white px-6 py-2 rounded-lg inline-block">
                Login as Donor
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
                 onClick={() => { setUserType('hospital'); setView('login'); }}>
              <Hospital className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Hospital Dashboard</h2>
              <p className="text-gray-600 mb-4">Manage blood inventory and update utilization records</p>
              <div className="bg-blue-500 text-white px-6 py-2 rounded-lg inline-block">
                Login as Hospital
              </div>
            </div>
          </div>

          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Why Lifeline Ledger?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow">
                <Activity className="w-10 h-10 text-green-500 mb-3" />
                <h4 className="font-bold text-gray-800 mb-2">Complete Transparency</h4>
                <p className="text-gray-600 text-sm">Track your donation from collection to utilization</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <Activity className="w-10 h-10 text-yellow-500 mb-3" />
                <h4 className="font-bold text-gray-800 mb-2">Real-Time Updates</h4>
                <p className="text-gray-600 text-sm">Get notified when your blood saves a life</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <CheckCircle className="w-10 h-10 text-blue-500 mb-3" />
                <h4 className="font-bold text-gray-800 mb-2">Privacy Protected</h4>
                <p className="text-gray-600 text-sm">Patient details remain confidential</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            {userType === 'donor' ? (
              <User className="w-12 h-12 text-red-500 mx-auto mb-3" />
            ) : (
              <Hospital className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            )}
            <h2 className="text-2xl font-bold text-gray-800">
              {userType === 'donor' ? 'Donor Login' : 'Hospital Login'}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleLogin}
              className={`w-full ${userType === 'donor' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 rounded-lg font-semibold transition`}
            >
              Login
            </button>
          </div>

          <button
            onClick={() => { setView('home'); setUserType(null); }}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (view === 'donorDashboard') {
    const myDonations = getDonorDonations();
    const usedCount = myDonations.filter(d => d.status === 'used').length;
    const availableCount = myDonations.filter(d => d.status === 'available').length;

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-red-500 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Lifeline Ledger</h1>
            </div>
            <div className="flex items-center gap-4">
              <span>Welcome, {currentUser.name}</span>
              <button onClick={handleLogout} className="bg-red-700 px-4 py-2 rounded hover:bg-red-800 transition">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <Activity className="w-10 h-10 text-blue-500 mb-3" />
              <h3 className="text-gray-600 mb-1">Total Donations</h3>
              <p className="text-3xl font-bold text-gray-800">{myDonations.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
              <h3 className="text-gray-600 mb-1">Blood Used</h3>
              <p className="text-3xl font-bold text-gray-800">{usedCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <Clock className="w-10 h-10 text-yellow-500 mb-3" />
              <h3 className="text-gray-600 mb-1">Available</h3>
              <p className="text-3xl font-bold text-gray-800">{availableCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Donation History</h2>
            
            {myDonations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No donations recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {myDonations.map((donation) => (
                  <div key={donation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">Donation #{donation.id}</h3>
                        <p className="text-sm text-gray-600">Blood Type: {donation.bloodType} | Quantity: {donation.quantity}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        donation.status === 'used' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {donation.status === 'used' ? '✓ Used' : '⏳ Available'}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Donation Date:</p>
                        <p className="font-semibold text-gray-800">{donation.date}</p>
                      </div>
                      
                      {donation.status === 'used' && (
                        <>
                          <div>
                            <p className="text-gray-600">Used Date:</p>
                            <p className="font-semibold text-gray-800">{donation.usedDate}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Used By:</p>
                            <p className="font-semibold text-gray-800">{donation.usedBy}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Purpose:</p>
                            <p className="font-semibold text-gray-800">{donation.purpose}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'hospitalDashboard') {
    const availableDonations = donations.filter(d => d.status === 'available');
    const usedDonations = donations.filter(d => d.status === 'used');

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-500 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Hospital className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Lifeline Ledger - Hospital</h1>
            </div>
            <div className="flex items-center gap-4">
              <span>Welcome, {currentUser.name}</span>
              <button onClick={handleLogout} className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800 transition">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <Activity className="w-10 h-10 text-blue-500 mb-3" />
              <h3 className="text-gray-600 mb-1">Total Blood Units</h3>
              <p className="text-3xl font-bold text-gray-800">{donations.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <Clock className="w-10 h-10 text-yellow-500 mb-3" />
              <h3 className="text-gray-600 mb-1">Available</h3>
              <p className="text-3xl font-bold text-gray-800">{availableDonations.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
              <h3 className="text-gray-600 mb-1">Utilized</h3>
              <p className="text-3xl font-bold text-gray-800">{usedDonations.length}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Record New Donation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Donor ID</label>
                  <input
                    type="text"
                    value={donorId}
                    onChange={(e) => setDonorId(e.target.value)}
                    placeholder="e.g., D001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Quantity</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="350ml">350ml</option>
                    <option value="450ml">450ml</option>
                    <option value="500ml">500ml</option>
                  </select>
                </div>
                <button onClick={handleAddDonation} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-semibold">
                  Record Donation
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Update Utilization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Donation ID</label>
                  <select
                    value={donationId}
                    onChange={(e) => setDonationId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Available Donation</option>
                    {availableDonations.map(d => (
                      <option key={d.id} value={d.id}>{d.id} - {d.bloodType} ({d.donorName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Purpose</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g., Emergency Surgery"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button onClick={handleUpdateUtilization} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold">
                  Update Utilization
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Blood Inventory</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Donation ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Donor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Blood Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{donation.id}</td>
                      <td className="px-4 py-3 text-sm">{donation.donorName}</td>
                      <td className="px-4 py-3 text-sm">{donation.bloodType}</td>
                      <td className="px-4 py-3 text-sm">{donation.quantity}</td>
                      <td className="px-4 py-3 text-sm">{donation.date}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          donation.status === 'used' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {donation.status === 'used' ? 'Used' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LifelineLedger;
