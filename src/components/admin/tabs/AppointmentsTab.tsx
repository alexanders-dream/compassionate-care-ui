import AppointmentScheduler from "@/components/admin/AppointmentScheduler";
import { Appointment } from "@/data/siteContent";
import { VisitRequest, ProviderReferralSubmission } from "@/contexts/SiteDataContext";

interface AppointmentsTabProps {
    visitRequests: VisitRequest[];
    referrals: ProviderReferralSubmission[];
    onUpdateVisitStatus: (id: string, status: VisitRequest["status"]) => void;
    onUpdateReferralStatus: (id: string, status: ProviderReferralSubmission["status"]) => void;
    onUpdateAppointmentStatus?: (id: string, status: Appointment["status"]) => void;
    externalAppointments: Appointment[];
    onAppointmentsChange: (appointments: Appointment[]) => void;
    onDelete: (id: string) => void;
}

const AppointmentsTab = ({
    visitRequests,
    referrals,
    onUpdateVisitStatus,
    onUpdateReferralStatus,
    onUpdateAppointmentStatus,
    externalAppointments,
    onAppointmentsChange,
    onDelete
}: AppointmentsTabProps) => {
    return (
        <AppointmentScheduler
            visitRequests={visitRequests}
            referrals={referrals}
            onUpdateVisitStatus={onUpdateVisitStatus}
            onUpdateReferralStatus={onUpdateReferralStatus}
            onUpdateAppointmentStatus={onUpdateAppointmentStatus}
            externalAppointments={externalAppointments}
            onAppointmentsChange={onAppointmentsChange}
            onDelete={onDelete}
        />
    );
};

export default AppointmentsTab;
