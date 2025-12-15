import AppointmentScheduler from "@/components/admin/AppointmentScheduler";
import { Appointment } from "@/data/siteContent";
import { VisitRequest, ProviderReferralSubmission } from "@/contexts/SiteDataContext";

interface AppointmentsTabProps {
    visitRequests: VisitRequest[];
    referrals: ProviderReferralSubmission[];
    onUpdateVisitStatus: (id: string, status: VisitRequest["status"]) => void;
    onUpdateReferralStatus: (id: string, status: ProviderReferralSubmission["status"]) => void;
    externalAppointments: Appointment[];
    onAppointmentsChange: (appointments: Appointment[]) => void;
}

const AppointmentsTab = ({
    visitRequests,
    referrals,
    onUpdateVisitStatus,
    onUpdateReferralStatus,
    externalAppointments,
    onAppointmentsChange,
}: AppointmentsTabProps) => {
    return (
        <AppointmentScheduler
            visitRequests={visitRequests}
            referrals={referrals}
            onUpdateVisitStatus={onUpdateVisitStatus}
            onUpdateReferralStatus={onUpdateReferralStatus}
            externalAppointments={externalAppointments}
            onAppointmentsChange={onAppointmentsChange}
        />
    );
};

export default AppointmentsTab;
