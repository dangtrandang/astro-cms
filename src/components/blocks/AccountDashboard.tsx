'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDirectusAssetURL } from '@/lib/directus/directus-utils';

interface User {
	id: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	avatar?: string | { id: string } | null;
	provider?: string | null;
	external_identifier?: string | null;
}

interface Contact {
	id: string;
	phone?: string;
	first_name?: string;
	last_name?: string;
}

export interface BlockAccountConfig {
	id: string;
	title?: string;
	default_tab: string;
	enabled_tabs: string[];
	tab_labels: Record<string, string>;
	allow_avatar_edit: boolean;
	allow_cover_edit: boolean;
	show_logout_button: boolean;
	support_content?: string;
}

interface Props {
	user: User;
	contact: Contact | null;
	blockConfig: BlockAccountConfig;
}

const DEFAULT_TAB_LABELS: Record<string, string> = {
	'account-info': 'Thông tin tài khoản',
	'account-edit': 'Cập nhật thông tin',
	baomat: 'Bảo mật',
	billing: 'Hoá đơn',
	topup: 'Nạp tiền',
	'chat-history': 'Lịch sử chat',
	support: 'Hỗ trợ',
};

function getAvatarUrl(avatar: User['avatar']): string | null {
	if (!avatar) return null;
	if (typeof avatar === 'string') return getDirectusAssetURL(avatar);
	if (typeof avatar === 'object' && 'id' in avatar) return getDirectusAssetURL(avatar.id);
	return null;
}

export default function AccountDashboard({ user, contact: initialContact, blockConfig }: Props) {
	const [activeTab, setActiveTab] = useState(blockConfig.default_tab);
	const [contactState, setContactState] = useState<Contact | null>(initialContact);

	const resolveTab = useCallback(
		(hash: string) => {
			if (hash && blockConfig.enabled_tabs.includes(hash)) return hash;
			if (hash) return blockConfig.default_tab;
			return activeTab || blockConfig.default_tab;
		},
		[blockConfig, activeTab],
	);

	useEffect(() => {
		const handleHashChange = () => {
			const hash = window.location.hash.replace('#', '');
			const tab = resolveTab(hash);
			setActiveTab(tab);
			if (hash && tab === blockConfig.default_tab && hash !== blockConfig.default_tab) {
				window.location.hash = blockConfig.default_tab;
			}
		};

		handleHashChange();
		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, [resolveTab, blockConfig.default_tab]);

	useEffect(() => {
		if (!contactState?.phone && blockConfig.enabled_tabs.includes('account-edit')) {
			setActiveTab('account-edit');
			window.location.hash = 'account-edit';
		}
	}, []);

	const handleContactUpdated = (updated: { first_name?: string; last_name?: string; phone: string }) => {
		setContactState((prev) => {
			if (!prev) return { id: '', ...updated };
			return { ...prev, ...updated };
		});
		const infoTab = 'account-info';
		if (blockConfig.enabled_tabs.includes(infoTab)) {
			setActiveTab(infoTab);
			window.location.hash = infoTab;
		}
	};

	const handleTabClick = (tab: string) => {
		window.location.hash = tab;
	};

	const avatarUrl = getAvatarUrl(user.avatar);
	const displayFirst = contactState?.first_name || user.first_name || '';
	const displayLast = contactState?.last_name || user.last_name || '';
	const fullName = [displayFirst, displayLast].filter(Boolean).join(' ') || 'Người dùng';
	const avatarInitial = ((displayFirst || displayLast || 'N').charAt(0)).toUpperCase();

	const tabs = useMemo(() => {
		return blockConfig.enabled_tabs.map((key) => ({
			key,
			label: blockConfig.tab_labels?.[key] || DEFAULT_TAB_LABELS[key] || key,
		}));
	}, [blockConfig.enabled_tabs, blockConfig.tab_labels]);

	const renderTabContent = () => {
		switch (activeTab) {
			case 'account-info':
				return <AccountInfo user={user} contact={contactState} fullName={fullName} />;
			case 'account-edit':
				return <AccountEdit user={user} contact={contactState} onUpdated={handleContactUpdated} />;
			case 'baomat':
				return <SecurityTab user={user} />;
			case 'support':
				return <SupportContent content={blockConfig.support_content} />;
			default:
				return (
					<PlaceholderTab
						tab={activeTab}
						label={blockConfig.tab_labels?.[activeTab] || DEFAULT_TAB_LABELS[activeTab] || activeTab}
					/>
				);
		}
	};

	return (
		<div className="flex flex-col lg:flex-row min-h-[70vh] bg-white rounded-2xl shadow-lg border border-[#f5e1e0] overflow-hidden">
			<div className="lg:w-72 xl:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-[#f5e1e0] bg-[#faf6f2] flex flex-col">
					<div className="h-28 bg-gradient-to-r from-[#f1907c] to-[#e17055]" />
	
					<div className="flex justify-center -mt-10 relative">
						<div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md">
							{avatarUrl ? (
								<img src={avatarUrl} alt={fullName} className="w-full h-full object-cover bg-[#fcf5ee]" />
							) : (
								<div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-[#fcf5ee] to-[#f5e1e0] text-[#6b4f4f]">
									{avatarInitial}
								</div>
							)}
						</div>
					</div>

				<div className="text-center mt-3 px-4">
					<h2 className="font-semibold text-[#1f2a1d] truncate">{fullName}</h2>
					<p className="text-sm text-[#9bab92] truncate">{user.email}</p>
				</div>

				<nav className="mt-6 px-3 flex-1">
					{tabs.map((tab) => (
						<button
							key={tab.key}
							type="button"
							onClick={() => handleTabClick(tab.key)}
							className={`w-full text-left px-4 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors ${
								activeTab === tab.key
									? 'bg-[#1f2a1d] text-white'
									: 'text-[#4a5a40] hover:bg-[#f5e1e0]'
							}`}
						>
							{tab.label}
						</button>
					))}
				</nav>

				{blockConfig.show_logout_button && (
					<div className="px-3 pb-4">
						<a
							href="/api/auth/logout"
							className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-[#e8d5d5] text-[#6b4f4f] text-sm font-medium rounded-xl hover:bg-[#f5e1e0] transition-colors"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
							Đăng xuất
						</a>
					</div>
				)}
			</div>

			<div className="flex-1 p-6 lg:p-8">{renderTabContent()}</div>
		</div>
	);
}

function AccountInfo({ user, contact, fullName }: { user: User; contact: Contact | null; fullName: string }) {
	const providerLabel = getProviderLabel(user.provider, user.external_identifier);
	const isSocialLogin = user.provider === 'google' || user.provider === 'facebook';

	return (
		<div>
			<h3 className="text-xl font-bold text-[#1f2a1d] mb-6">Thông tin tài khoản</h3>
			<div className="space-y-4">
				<InfoRow label="Họ tên" value={fullName} />
				<InfoRow label="Email" value={user.email || 'Chưa cập nhật'} />
				<InfoRow label="Điện thoại" value={contact?.phone || 'Chưa cập nhật'} />

				<div className="p-4 bg-[#fcf5ee] rounded-xl">
					<span className="text-sm text-[#9bab92]">Phương thức đăng nhập</span>
					<p className="text-[#1f2a1d] font-medium mt-0.5 flex items-center gap-2">
						{providerLabel.icon}
						{providerLabel.text}
					</p>
				</div>

				{isSocialLogin ? (
					<div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-2.5">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>Tài khoản đã được liên kết bảo mật</span>
					</div>
				) : (
					<div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-2.5">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>Tài khoản của bạn được bảo vệ bằng mật khẩu riêng.</span>
					</div>
				)}
			</div>
		</div>
	);
}

function getProviderLabel(provider?: string | null, externalIdentifier?: string | null): { text: string; icon: string } {
	switch (provider) {
		case 'google':
			return { text: 'Đăng nhập bằng Google', icon: '🔵' };
		case 'facebook':
			return { text: 'Đăng nhập bằng Facebook', icon: '🔵' };
		default:
			if (!externalIdentifier) {
				return { text: 'Đăng ký trực tiếp (Email/Mật khẩu)', icon: '📧' };
			}
			return { text: 'Đăng nhập bằng tài khoản ngoài', icon: '🔑' };
	}
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="p-4 bg-[#fcf5ee] rounded-xl">
			<span className="text-sm text-[#9bab92]">{label}</span>
			<p className="text-[#1f2a1d] font-medium mt-0.5">{value}</p>
		</div>
	);
}

function AccountEdit({
	user,
	contact,
	onUpdated,
}: {
	user: User;
	contact: Contact | null;
	onUpdated: (values: { first_name?: string; last_name?: string; phone: string }) => void;
}) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');
		setSuccess(false);
		setSubmitting(true);

		const form = e.currentTarget;
		const formData = new FormData(form);

		const newFirstName = (formData.get('first_name') as string)?.trim() || undefined;
		const newLastName = (formData.get('last_name') as string)?.trim() || undefined;
		const newPhone = (formData.get('phone') as string)?.trim() || '';

		try {
			const res = await fetch('/api/auth/update-contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({
					contactId: contact?.id,
					first_name: newFirstName,
					last_name: newLastName,
					phone: newPhone,
				}),
			});

			if (!res.ok) {
				const errData = await res.json().catch(() => null);
				throw new Error(errData?.error || 'Cập nhật thất bại');
			}

			const savedData = await res.json().catch(() => null);
			const savedContact = savedData?.contact;

			setSuccess(true);
			setTimeout(() => {
				if (savedContact) {
					onUpdated({
						first_name: savedContact.first_name,
						last_name: savedContact.last_name,
						phone: savedContact.phone || '',
					});
				} else {
					onUpdated({
						first_name: newFirstName,
						last_name: newLastName,
						phone: newPhone,
					});
				}
			}, 800);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Lỗi không xác định');
		} finally {
			setSubmitting(false);
		}
	};

	const isFreshAccount = !contact?.phone;

	return (
		<div>
			<h3 className="text-xl font-bold text-[#1f2a1d] mb-2">Cập nhật thông tin</h3>
			{isFreshAccount && (
				<p className="text-sm text-[#6b7a65] mb-6">
					Vui lòng cung cấp số điện thoại để hoàn tất thiết lập tài khoản
				</p>
			)}

			{error && (
				<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
					{error}
				</div>
			)}
			{success && (
				<div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
					Cập nhật thành công!
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-5">
				<div>
					<label htmlFor="edit_first_name" className="block text-sm font-medium text-[#1f2a1d] mb-1">
						Họ
					</label>
					<input
						type="text"
						id="edit_first_name"
						name="first_name"
						defaultValue={contact?.first_name || user.first_name || ''}
						className="w-full px-4 py-2.5 border border-[#e8d5d5] rounded-xl bg-white focus:ring-2 focus:ring-[#c0395b]/30 focus:border-[#c0395b] outline-none transition"
					/>
				</div>

				<div>
					<label htmlFor="edit_last_name" className="block text-sm font-medium text-[#1f2a1d] mb-1">
						Tên
					</label>
					<input
						type="text"
						id="edit_last_name"
						name="last_name"
						defaultValue={contact?.last_name || user.last_name || ''}
						className="w-full px-4 py-2.5 border border-[#e8d5d5] rounded-xl bg-white focus:ring-2 focus:ring-[#c0395b]/30 focus:border-[#c0395b] outline-none transition"
					/>
				</div>

				<div>
					<label htmlFor="edit_phone" className="block text-sm font-medium text-[#1f2a1d] mb-1">
						Số điện thoại
					</label>
					<input
						type="tel"
						id="edit_phone"
						name="phone"
						placeholder="VD: 0912345678"
						defaultValue={contact?.phone || ''}
						className="w-full px-4 py-2.5 border border-[#e8d5d5] rounded-xl bg-white focus:ring-2 focus:ring-[#c0395b]/30 focus:border-[#c0395b] outline-none transition"
					/>
				</div>

				<button
					type="submit"
					disabled={submitting}
					className="w-full bg-[#1f2a1d] hover:bg-[#850e35] disabled:bg-[#9bab92] text-white font-medium py-3 px-6 rounded-full transition-colors"
				>
					{submitting ? 'Đang lưu...' : 'Lưu thông tin'}
				</button>
			</form>
		</div>
	);
}

function SupportContent({ content }: { content?: string }) {
	return (
		<div>
			<h3 className="text-xl font-bold text-[#1f2a1d] mb-6">Hỗ trợ</h3>
			{content ? (
				<div
					className="prose prose-sm max-w-none text-[#3d4d35] whitespace-pre-wrap"
					dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content) }}
				/>
			) : (
				<p className="text-[#9bab92]">Chưa có nội dung hỗ trợ.</p>
			)}
		</div>
	);
}

function simpleMarkdownToHtml(md: string): string {
	let html = md
		.replace(/&/g, '&')
		.replace(/</g, '<')
		.replace(/>/g, '>');
	html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
	html = html.replace(/`(.+?)`/g, '<code class="bg-[#f5e1e0] px-1 rounded text-sm">$1</code>');
	html = html.replace(/^### (.+)$/gm, '<h4 class="font-semibold text-[#1f2a1d] mt-4 mb-2">$1</h4>');
	html = html.replace(/^## (.+)$/gm, '<h3 class="font-semibold text-[#1f2a1d] mt-4 mb-2">$1</h3>');
	html = html.replace(/^# (.+)$/gm, '<h2 class="font-bold text-[#1f2a1d] mt-4 mb-2">$1</h2>');
	html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-[#3d4d35]">$1</li>');
	html = html.replace(/\n\n/g, '</p><p class="text-[#3d4d35]">');
	html = '<p class="text-[#3d4d35]">' + html + '</p>';
	return html;
}

function SecurityTab({ user }: { user: User }) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [done, setDone] = useState(false);

	const isGoogle = user.provider === 'google';

	const handleConvert = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');
		setSuccess(false);
		setSubmitting(true);

		const form = e.currentTarget;
		const formData = new FormData(form);
		const password = (formData.get('password') as string) || '';
		const confirm = (formData.get('confirm_password') as string) || '';

		if (password.length < 8) {
			setError('Mật khẩu phải có ít nhất 8 ký tự');
			setSubmitting(false);
			return;
		}

		if (password !== confirm) {
			setError('Mật khẩu xác nhận không khớp');
			setSubmitting(false);
			return;
		}

		try {
			const res = await fetch('/api/auth/convert-provider', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password }),
			});

			const data = await res.json().catch(() => null);

			if (res.ok) {
				setSuccess(true);
				setDone(true);
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			} else {
				setError(data?.error || 'Không thể cập nhật tài khoản');
			}
		} catch {
			setError('Lỗi kết nối, vui lòng thử lại');
		} finally {
			setSubmitting(false);
		}
	};

	if (done) {
		return (
			<div>
				<h3 className="text-xl font-bold text-[#1f2a1d] mb-6">Bảo mật</h3>
				<div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
					<div className="text-3xl mb-3">🔐</div>
					<p className="text-green-800 font-semibold text-lg mb-2">Tài khoản đã được bảo vệ tuyệt đối</p>
					<p className="text-sm text-green-700 leading-relaxed">
						Tài khoản của bạn giờ đây là "lô cốt bất khả xâm phạm". Bạn sẽ không thể đăng nhập nhanh bằng Google được nữa. Mọi dữ liệu (lịch sử chat, thanh toán) được bảo toàn 100%.
					</p>
				</div>
			</div>
		);
	}

	if (!isGoogle) {
		return (
			<div>
				<h3 className="text-xl font-bold text-[#1f2a1d] mb-6">Bảo mật</h3>
				<div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-3 mb-4">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
						<polyline points="20 6 9 17 4 12" />
					</svg>
					<span>Tài khoản của bạn đã được bảo vệ bằng mật khẩu riêng.</span>
				</div>
				<p className="text-sm text-[#6b7a65] leading-relaxed">
					Bạn đăng nhập bằng Email và Mật khẩu. Không ai có thể truy cập tài khoản của bạn qua Google.
				</p>
			</div>
		);
	}

	return (
		<div>
			<h3 className="text-xl font-bold text-[#1f2a1d] mb-6">Bảo mật</h3>

			<div className="p-4 bg-red-50/50 border border-red-200 rounded-xl mb-6">
				<div className="flex items-start gap-3">
					<span className="text-lg shrink-0 mt-0.5">⚠️</span>
					<div>
						<p className="font-semibold text-red-800 mb-1">Ngắt kết nối Google & Sử dụng Mật khẩu riêng</p>
						<p className="text-sm text-red-700 leading-relaxed">
							Để bảo vệ tối đa sự riêng tư của bạn, hãy thiết lập mật khẩu. Sau khi thiết lập, bạn sẽ không thể đăng nhập nhanh bằng Google được nữa.
						</p>
					</div>
				</div>
			</div>

			{error && (
				<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
					{error}
				</div>
			)}
			{success && (
				<div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
					{success}
				</div>
			)}

			<form onSubmit={handleConvert} className="space-y-5">
				<div>
					<label htmlFor="sec_password" className="block text-sm font-medium text-[#1f2a1d] mb-1">
						Mật khẩu mới
					</label>
					<input
						type="password"
						id="sec_password"
						name="password"
						required
						minLength={8}
						autoComplete="new-password"
						placeholder="Ít nhất 8 ký tự"
						className="w-full px-4 py-2.5 border border-[#e8d5d5] rounded-xl bg-white focus:ring-2 focus:ring-[#c0395b]/30 focus:border-[#c0395b] outline-none transition"
					/>
				</div>

				<div>
					<label htmlFor="sec_confirm" className="block text-sm font-medium text-[#1f2a1d] mb-1">
						Xác nhận mật khẩu
					</label>
					<input
						type="password"
						id="sec_confirm"
						name="confirm_password"
						required
						minLength={8}
						autoComplete="new-password"
						placeholder="Nhập lại mật khẩu"
						className="w-full px-4 py-2.5 border border-[#e8d5d5] rounded-xl bg-white focus:ring-2 focus:ring-[#c0395b]/30 focus:border-[#c0395b] outline-none transition"
					/>
				</div>

				<button
					type="submit"
					disabled={submitting}
					className="w-full bg-[#c0392b] hover:bg-[#a93226] disabled:bg-[#9bab92] text-white font-medium py-3 px-6 rounded-full transition-colors"
				>
					{submitting ? 'Đang xử lý...' : 'Ngắt kết nối Google & Lưu mật khẩu'}
				</button>
			</form>
		</div>
	);
}

function PlaceholderTab({ tab, label }: { tab: string; label: string }) {
	return (
		<div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
			<div className="w-16 h-16 bg-[#fcf5ee] rounded-full flex items-center justify-center mb-4">
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9bab92" strokeWidth="1.5">
					<path d="M12 2L2 7l10 5 10-5-10-5z" />
					<path d="M2 17l10 5 10-5" />
					<path d="M2 12l10 5 10-5" />
				</svg>
			</div>
			<h3 className="text-lg font-semibold text-[#1f2a1d] mb-2">{label}</h3>
			<p className="text-sm text-[#9bab92] max-w-sm">Tính năng này đang được phát triển. Vui lòng quay lại sau.</p>
		</div>
	);
}
