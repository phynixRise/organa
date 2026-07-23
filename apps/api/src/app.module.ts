import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { LocationsModule } from './locations/locations.module';
import { StaffShiftsModule } from './staff-shifts/staff-shifts.module';
import { EventsModule } from './events/events.module';
import { OrgFeaturesModule } from './org-features/org-features.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    CustomersModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    AppointmentsModule,
    LocationsModule,
    StaffShiftsModule,
    EventsModule,
    OrgFeaturesModule,
    SuperAdminModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
