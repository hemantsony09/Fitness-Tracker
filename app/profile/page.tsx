'use client';

import { useState } from 'react';
import { useUserProfile, useUpdateUserProfile } from '@/hooks/useUserProfile';
import { calculateBMR, calculateTDEE } from '@/lib/calorieCalculator';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { User, Weight, Ruler, Calendar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    weight: profile?.weight || 70,
    height: profile?.height || 170,
    age: profile?.age || 25,
    gender: profile?.gender || 'male' as 'male' | 'female' | 'other',
  });

  // Update form when profile loads
  if (profile && !isEditing) {
    if (formData.weight !== profile.weight || formData.height !== profile.height) {
      setFormData({
        weight: profile.weight,
        height: profile.height,
        age: profile.age || 25,
        gender: profile.gender || 'male',
      });
    }
  }

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const bmr = profile ? calculateBMR(profile) : 0;
  const tdee = profile ? calculateTDEE(profile) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pb-24 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="sticky top-0 bg-black border-b border-gray-800 z-10 px-4 py-4">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your personal information</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        {profile && (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="text-gray-400" size={20} />
                </div>
                <div className="text-xs text-gray-400 mb-1">BMR</div>
                <div className="text-xl font-bold text-white">{bmr}</div>
                <div className="text-xs text-gray-500">cal/day</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="text-gray-400" size={20} />
                </div>
                <div className="text-xs text-gray-400 mb-1">TDEE</div>
                <div className="text-xl font-bold text-white">{tdee}</div>
                <div className="text-xs text-gray-500">cal/day</div>
              </div>
            </Card>
          </div>
        )}

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Personal Information</h2>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                variant="outline"
              >
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Weight className="inline mr-2" size={16} />
                    Weight (kg)
                  </label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    min="30"
                    max="200"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Ruler className="inline mr-2" size={16} />
                    Height (cm)
                  </label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                    min="100"
                    max="250"
                    step="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    Age
                  </label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
                    min="10"
                    max="100"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="inline mr-2" size={16} />
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                    className="w-full px-4 py-3 text-base rounded-xl border-2 border-gray-800 bg-black text-white focus:border-white focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  fullWidth
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                >
                  Save
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      weight: profile?.weight || 70,
                      height: profile?.height || 170,
                      age: profile?.age || 25,
                      gender: profile?.gender || 'male',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <div className="flex items-center gap-2 text-gray-400">
                  <Weight size={18} />
                  <span>Weight</span>
                </div>
                <span className="text-white font-semibold">{profile?.weight || 70} kg</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <div className="flex items-center gap-2 text-gray-400">
                  <Ruler size={18} />
                  <span>Height</span>
                </div>
                <span className="text-white font-semibold">{profile?.height || 170} cm</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={18} />
                  <span>Age</span>
                </div>
                <span className="text-white font-semibold">{profile?.age || 25} years</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <User size={18} />
                  <span>Gender</span>
                </div>
                <span className="text-white font-semibold capitalize">{profile?.gender || 'male'}</span>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-2">About Calorie Calculations</p>
            <p className="text-xs text-gray-500">
              BMR (Basal Metabolic Rate) is calculated using the Mifflin-St Jeor equation.
              TDEE (Total Daily Energy Expenditure) assumes moderate activity level (1.5x BMR).
              Exercise calories are calculated based on MET values and your body weight.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

