import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Gateway } from './entities/gateway.entity';
import { Repository } from 'typeorm';
import { MerchantService } from '../merchant/merchant.service';
import { Merchant } from '../merchant/entities/merchant.entity';
import { GatewayType } from '../payment-methods/enums/gateway-type';

@Injectable()
export class GatewaysService {

  private readonly logger = new Logger(GatewaysService.name, { timestamp: true });

  constructor(
    @InjectRepository(Gateway) private readonly gatewayRepository: Repository<Gateway>,
    private readonly merchantService: MerchantService,
  ) { }

  async create(createGatewayDto: CreateGatewayDto) {

    // Find the merchant by ID
    const merchant = await this.merchantService.findOne(createGatewayDto.merchantId);

    // If merchant not found, throw an exception
    if (!merchant) {

      this.logger.error(`Merchant was not found`);

      throw new NotFoundException(`Merchant with ID ${createGatewayDto.merchantId} not found`);
    }


    // Create the new gateway entity
    const newGateway = this.gatewayRepository.create({
      ...createGatewayDto,
      merchant, // Attach the merchant entity
    });

    this.logger.log('The item was created', createGatewayDto);

    // Save the gateway entity
    return this.gatewayRepository.save(newGateway);
  }

  findAll() {
    this.logger.log('The items was found all');
    return this.gatewayRepository.find({ relations: ['merchant'] });
  }

  findOne(id: number) {

    this.logger.log('The item was found', id);

    return this.gatewayRepository.findOne({ where: { id }, relations: ['merchant'] });
  }

  async update(id: number, updateGatewayDto: UpdateGatewayDto) {

    // Find the existing gateway
    const gateway = await this.gatewayRepository.findOne({ where: { id } });
    if (!gateway) {

      this.logger.error(`Gateway with ID ${id} not found`);

      throw new NotFoundException(`Gateway with ID ${id} not found`);
    }

    // Find the merchant if merchantId is provided in the DTO
    let merchant = null;
    if (updateGatewayDto.merchantId) {
      merchant = await this.merchantService.findOne(updateGatewayDto.merchantId);
      if (!merchant) {

        this.logger.error(`Merchant was not found`);

        throw new NotFoundException(`Merchant with ID ${updateGatewayDto.merchantId} not found`);
      }
    }

    // Merge updated data into the existing gateway
    const updatedGateway = this.gatewayRepository.merge(gateway, {
      ...updateGatewayDto,
      ...(merchant && { merchant }), // Add merchant only if it exists
    });

    this.logger.log('The item was updated', updateGatewayDto);

    // Save the updated gateway entity
    return this.gatewayRepository.save(updatedGateway);
  }

  remove(id: number) {

    this.logger.warn('The item was removed', id);

    return this.gatewayRepository.delete(id);
  }

  findOneByMerchantId(merchantId: string) {
    this.logger.log('The item was found by MerchantId', merchantId);
    return this.gatewayRepository.findOne({
      where: {
        merchant: {
          merchantId: merchantId
        }
      },
      relations: ['merchant'], // Ensure the `merchant` relation is loaded
    });
  }

  findOneByType(type: GatewayType) {
    this.logger.log('The item was found by GatewayType', type);
    return this.gatewayRepository.findOne({
      where: {
        type
      }
    });
  }

}
