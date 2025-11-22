"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { Plus, Edit, Trash2, User, Mail, Phone, Award, Save, X } from "lucide-react";

interface TeamMember {
  id: string;
  admin_profile_id: string | null;
  name: string;
  email: string;
  phone: string;
  role: string;
  specializations: string;
  experience_years: string;
  certifications: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TeamManagerProps {
  className?: string;
}

export function TeamManager({ className = "" }: TeamManagerProps) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    specializations: "",
    experience_years: "",
    certifications: "",
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const roles = [
    "Aesthetic Practitioner",
    "Senior Aesthetic Practitioner", 
    "Clinical Director",
    "Nurse Practitioner",
    "Medical Aesthetician",
    "Consultant",
    "Therapist",
    "Support Staff"
  ];

  const specializations = [
    "Anti-wrinkle Treatments",
    "Dermal Fillers",
    "Lip Enhancement",
    "Profhilo Treatment",
    "Skin Consultation",
    "Fat Freezing",
    "Laser Hair Removal",
    "Chemical Peel",
    "Microneedling",
    "Hydrafacial",
    "Body Contouring",
    "Skin Rejuvenation"
  ];

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/team");
      if (response.ok) {
        const data = await response.json();
        setTeam(data.team || []);
      } else {
        showError("Error", "Failed to load team members");
      }
    } catch (error) {
      showError("Error", "Error loading team members");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingMember 
        ? `/api/admin/team/${editingMember.id}`
        : "/api/admin/team";
      
      const method = editingMember ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess(
          "Success",
          editingMember 
            ? "Team member updated successfully!" 
            : "Team member added successfully!"
        );
        setShowAddForm(false);
        setEditingMember(null);
        setFormData({
          name: "",
          email: "",
          phone: "",
          role: "",
          specializations: "",
          experience_years: "",
          certifications: "",
          is_active: true
        });
        loadTeam();
      } else {
        showError("Error", "Failed to save team member");
      }
    } catch (error) {
      showError("Error", "Error saving team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      specializations: member.specializations,
      experience_years: member.experience_years,
      certifications: member.certifications,
      is_active: member.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    try {
      const response = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSuccess("Success", "Team member deleted successfully!");
        loadTeam();
      } else {
        showError("Error", "Failed to delete team member");
      }
    } catch (error) {
      showError("Error", "Error deleting team member");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingMember(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      specializations: "",
      experience_years: "",
      certifications: "",
      is_active: true
    });
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Team Members
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Manage your team members for booking assignments
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingMember ? "Edit Team Member" : "Add New Team Member"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="member@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+44 7700 900123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specializations
                </label>
                <input
                  type="text"
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Anti-wrinkle, Dermal Fillers, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Years of Experience
                </label>
                <input
                  type="text"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5+ years"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Certifications
                </label>
                <textarea
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="List relevant certifications and qualifications..."
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active team member</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : editingMember ? "Update" : "Add"} Team Member
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team List */}
      <div className="space-y-4">
        {team.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No team members added yet.</p>
            <p className="text-sm">Click "Add Team Member" to get started.</p>
          </div>
        ) : (
          team.map((member) => (
            <div
              key={member.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.is_active 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                    }`}>
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>{member.role}</span>
                    </div>
                    {member.experience_years && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{member.experience_years} experience</span>
                      </div>
                    )}
                  </div>

                  {member.specializations && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Specializations:</span> {member.specializations}
                      </p>
                    </div>
                  )}

                  {member.certifications && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Certifications:</span> {member.certifications}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Edit team member"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete team member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

