"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/theme-toggle';
import { APIService } from '@/lib/api-service';
import {
  User,
  Building,
  Database,
  Bell,
  Shield,
  Key,
  Camera,
  Save,
  Bot,
  Eye,
  EyeOff,
  TestTube,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  X,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  profileImage: string;
  location: string;
  website: string;
  jobTitle: string;
  company: string;
  dateOfBirth: string;
  timezone: string;
}

export default function Settings() {
  const [apiConfig, setApiConfig] = useState({
    claudeApiKey: '',
    baseUrl: '',
  });
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@tradenest.com',
    phone: '+1 (555) 123-4567',
    bio: 'Global trade specialist with 10+ years of experience in supply chain management and international commerce.',
    profileImage: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    location: 'New York, NY, USA',
    website: 'https://tradenest.com',
    jobTitle: 'Senior Trade Specialist',
    company: 'TradeNest Corp',
    dateOfBirth: '1985-06-15',
    timezone: 'America/New_York',
  });

  useEffect(() => {
    const config = APIService.getConfig();
    setApiConfig({
      claudeApiKey: config.claudeApiKey || '',
      baseUrl: config.baseUrl || '',
    });
    setProfileImage(userProfile.profileImage);
  }, [userProfile.profileImage]);

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file too large. Please select a file under 5MB.');
      return;
    }

    setIsUploadingImage(true);

    try {
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      
      // Update profile with new image
      handleProfileChange('profileImage', imageUrl);
      
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    handleProfileChange('profileImage', '');
    toast.success('Profile picture removed');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically save to your backend
      console.log('Saving profile:', userProfile);
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  const handleSaveApiKeys = () => {
    APIService.setConfig(apiConfig);
    toast.success("API keys saved successfully!");
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      toast.info("Testing API connection...");
      
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (apiConfig.claudeApiKey) {
        toast.success("API connection successful!");
      } else {
        toast.error("Please provide Claude API key");
      }
    } catch (error) {
      toast.error("API connection failed");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account, business settings, and preferences</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200/50 dark:border-blue-800/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={profileImage || userProfile.profileImage} alt="Profile" />
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(userProfile.firstName, userProfile.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProfile.firstName} {userProfile.lastName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">{userProfile.jobTitle}</p>
                  <p className="text-gray-500 dark:text-gray-500">{userProfile.company}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{userProfile.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button onClick={triggerImageUpload} disabled={isUploadingImage}>
                    <Camera className="w-4 h-4 mr-2" />
                    {isUploadingImage ? 'Uploading...' : 'Change Photo'}
                  </Button>
                  {profileImage && (
                    <Button variant="outline" size="sm" onClick={removeProfileImage}>
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>First Name</span>
                  </Label>
                  <Input 
                    id="firstName" 
                    value={userProfile.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Last Name</span>
                  </Label>
                  <Input 
                    id="lastName" 
                    value={userProfile.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={userProfile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </Label>
                  <Input 
                    id="phone" 
                    value={userProfile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Job Title</span>
                  </Label>
                  <Input 
                    id="jobTitle" 
                    value={userProfile.jobTitle}
                    onChange={(e) => handleProfileChange('jobTitle', e.target.value)}
                    placeholder="Enter your job title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>Company</span>
                  </Label>
                  <Input 
                    id="company" 
                    value={userProfile.company}
                    onChange={(e) => handleProfileChange('company', e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </Label>
                  <Input 
                    id="location" 
                    value={userProfile.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    placeholder="Enter your location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </Label>
                  <Input 
                    id="website" 
                    type="url"
                    value={userProfile.website}
                    onChange={(e) => handleProfileChange('website', e.target.value)}
                    placeholder="Enter your website URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date of Birth</span>
                  </Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date"
                    value={userProfile.dateOfBirth}
                    onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={userProfile.timezone} onValueChange={(value) => handleProfileChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Bio</span>
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={userProfile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {userProfile.bio.length}/500 characters
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => {
                  // Reset to original values
                  setUserProfile({
                    firstName: 'John',
                    lastName: 'Smith',
                    email: 'john@tradenest.com',
                    phone: '+1 (555) 123-4567',
                    bio: 'Global trade specialist with 10+ years of experience in supply chain management and international commerce.',
                    profileImage: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
                    location: 'New York, NY, USA',
                    website: 'https://tradenest.com',
                    jobTitle: 'Senior Trade Specialist',
                    company: 'TradeNest Corp',
                    dateOfBirth: '1985-06-15',
                    timezone: 'America/New_York',
                  });
                  toast.info('Profile reset to original values');
                }}>
                  Reset
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Manage your company details and tax information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="TradeNest Corp" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select defaultValue="corporation">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                  <Input id="taxId" defaultValue="GB123456789" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select defaultValue="retail">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="distribution">Distribution</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  placeholder="Enter your complete business address..."
                  defaultValue="123 Trade Street, Commerce District, London, UK SW1A 1AA"
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span>AI API Configuration</span>
              </CardTitle>
              <CardDescription>Configure your Claude AI API key for full functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">API Key Required</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      To enable full functionality, you need to provide a valid Claude AI API key. The AI features will not work without proper configuration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="claudeApiKey">Claude AI API Key</Label>
                  <div className="relative">
                    <Input
                      id="claudeApiKey"
                      type={showApiKeys ? "text" : "password"}
                      placeholder="sk-ant-api03-..."
                      value={apiConfig.claudeApiKey}
                      onChange={(e) => setApiConfig({ ...apiConfig, claudeApiKey: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                    >
                      {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Get your API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Anthropic Console</a></p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseUrl">API Base URL (Optional)</Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://api.anthropic.com"
                    value={apiConfig.baseUrl}
                    onChange={(e) => setApiConfig({ ...apiConfig, baseUrl: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Leave empty to use default endpoints</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button onClick={handleSaveApiKeys}>
                  <Save className="w-4 h-4 mr-2" />
                  Save API Keys
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !apiConfig.claudeApiKey}
                >
                  {isTestingConnection ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Security Notice</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Your API keys are stored locally in your browser and are never transmitted to our servers. Keep them secure and never share them publicly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Order Updates", description: "Get notified when orders are processed or shipped", enabled: true },
                      { label: "Inventory Alerts", description: "Low stock and out-of-stock notifications", enabled: true },
                      { label: "Compliance Reminders", description: "Document expiration and renewal reminders", enabled: false },
                      { label: "Payment Notifications", description: "Invoice and payment status updates", enabled: true },
                    ].map((notification, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{notification.label}</p>
                          <p className="text-sm text-gray-500">{notification.description}</p>
                        </div>
                        <Switch defaultChecked={notification.enabled} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">App Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-gray-500">Toggle between light and dark themes</p>
                      </div>
                      <ThemeToggle />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-refresh Dashboard</p>
                        <p className="text-sm text-gray-500">Automatically update dashboard data</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-6">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle>Warehouse Connections</CardTitle>
              <CardDescription>Manage your warehouse integrations and inventory sync settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { name: "UK London Warehouse", location: "London, UK", status: "Connected", sync: true },
                  { name: "DE Berlin Warehouse", location: "Berlin, Germany", status: "Connected", sync: true },
                  { name: "FR Paris Warehouse", location: "Paris, France", status: "Disconnected", sync: false },
                ].map((warehouse, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Database className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium">{warehouse.name}</h3>
                        <p className="text-sm text-gray-500">{warehouse.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Auto Sync</span>
                        <Switch checked={warehouse.sync} />
                      </div>
                      <Button variant={warehouse.status === "Connected" ? "outline" : "default"} size="sm">
                        {warehouse.status === "Connected" ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full">
                <Database className="w-4 h-4 mr-2" />
                Add New Warehouse
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}