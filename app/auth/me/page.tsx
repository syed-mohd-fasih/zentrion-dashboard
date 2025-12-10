"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, LogOut, Mail, Shield, Calendar } from "lucide-react";

export default function MePage() {
	const [isEditing, setIsEditing] = useState(false);
	const [profile, setProfile] = useState({
		name: "Alex Johnson",
		email: "alex.johnson@zentrion.dev",
		role: "Admin",
		department: "Security Engineering",
		joinDate: "January 15, 2024",
		lastLogin: "Today at 2:34 PM",
		avatar: "AJ",
	});

	return (
		<MainLayout>
			<div className="p-6 space-y-8">
				{/* Header */}
				<div className="bg-card border-b border-border p-6">
					<div className="flex items-center gap-4 mb-6">
						<Link href="/dashboard">
							<Button variant="ghost" size="icon" className="rounded-lg">
								<ArrowLeft className="w-5 h-5" />
							</Button>
						</Link>
						<h1 className="text-3xl font-bold text-foreground">User Profile</h1>
					</div>
				</div>

				{/* Content */}
				<div className="max-w-2xl mx-auto p-6 space-y-6">
					{/* Profile Card */}
					<Card className="p-8 space-y-6">
						{/* Avatar Section */}
						<div className="flex items-center gap-6">
							<div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
								{profile.avatar}
							</div>
							<div>
								<h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
								<p className="text-muted-foreground">{profile.role}</p>
								<p className="text-sm text-muted-foreground">{profile.department}</p>
							</div>
						</div>

						<div className="border-t border-border pt-6" />

						{/* Profile Details */}
						{!isEditing ? (
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">
											Email
										</p>
										<p className="text-foreground flex items-center gap-2">
											<Mail className="w-4 h-4 text-muted-foreground" />
											{profile.email}
										</p>
									</div>
									<div>
										<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">
											Role
										</p>
										<p className="text-foreground flex items-center gap-2">
											<Shield className="w-4 h-4 text-muted-foreground" />
											{profile.role}
										</p>
									</div>
									<div>
										<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">
											Join Date
										</p>
										<p className="text-foreground flex items-center gap-2">
											<Calendar className="w-4 h-4 text-muted-foreground" />
											{profile.joinDate}
										</p>
									</div>
									<div>
										<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">
											Last Login
										</p>
										<p className="text-foreground flex items-center gap-2">
											<Calendar className="w-4 h-4 text-muted-foreground" />
											{profile.lastLogin}
										</p>
									</div>
								</div>

								<div className="border-t border-border pt-6 flex gap-3">
									<Button
										onClick={() => setIsEditing(true)}
										className="bg-primary hover:bg-primary/90 rounded-lg"
									>
										Edit Profile
									</Button>
									<Button variant="ghost" className="rounded-lg gap-2">
										<LogOut className="w-4 h-4" />
										Sign Out
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<div>
									<label className="text-sm font-medium text-foreground block mb-2">Full Name</label>
									<Input
										value={profile.name}
										onChange={(e) => setProfile({ ...profile, name: e.target.value })}
										className="rounded-lg"
									/>
								</div>
								<div>
									<label className="text-sm font-medium text-foreground block mb-2">Email</label>
									<Input
										value={profile.email}
										onChange={(e) => setProfile({ ...profile, email: e.target.value })}
										className="rounded-lg"
									/>
								</div>
								<div>
									<label className="text-sm font-medium text-foreground block mb-2">Department</label>
									<Input
										value={profile.department}
										onChange={(e) => setProfile({ ...profile, department: e.target.value })}
										className="rounded-lg"
									/>
								</div>
								<div className="border-t border-border pt-4 flex gap-3">
									<Button
										onClick={() => setIsEditing(false)}
										className="bg-primary hover:bg-primary/90 rounded-lg"
									>
										Save Changes
									</Button>
									<Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-lg">
										Cancel
									</Button>
								</div>
							</div>
						)}
					</Card>

					{/* Account Settings */}
					<Card className="p-6 space-y-4">
						<h3 className="font-semibold text-foreground">Account Settings</h3>
						<div className="space-y-2">
							<Button variant="ghost" className="w-full justify-start rounded-lg text-left">
								Change Password
							</Button>
							<Button variant="ghost" className="w-full justify-start rounded-lg text-left">
								Two-Factor Authentication
							</Button>
							<Button variant="ghost" className="w-full justify-start rounded-lg text-left">
								Connected Devices
							</Button>
							<Button
								variant="ghost"
								className="w-full justify-start rounded-lg text-left text-destructive"
							>
								Delete Account
							</Button>
						</div>
					</Card>
				</div>
			</div>
		</MainLayout>
	);
}
