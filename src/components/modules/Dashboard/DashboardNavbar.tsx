import { getDefaultDashboardRoute } from '@/lib/authUtils';
import { getNavItemsByRole } from '@/lib/navItems';
import { getUserInfo } from '@/services/auth.services';
import { NavSection } from '@/types/dashboard.type';
import DashboardNavbarContent from './DashboardNavbarContent';

const DashboardNavbar = async () => {
    const userInfo = await getUserInfo();
    const navItems: NavSection[] = getNavItemsByRole(userInfo.role);
    const dashboardHome = getDefaultDashboardRoute(userInfo.role);

    return (
        <DashboardNavbarContent dashboardHome={dashboardHome} navItems={navItems} userInfo={userInfo} />
    )
}

export default DashboardNavbar