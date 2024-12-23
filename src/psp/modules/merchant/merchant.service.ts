import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MerchantService {

  private readonly logger = new Logger(MerchantService.name, { timestamp: true });

  constructor(
    @InjectRepository(Merchant) private readonly merchantRepository: Repository<Merchant>,
  ) { }

  create(createMerchantDto: CreateMerchantDto) {
    this.logger.log('The item was created', createMerchantDto);
    return this.merchantRepository.save(createMerchantDto);
  }

  findAll() {
    this.logger.log('The items was found all');
    return this.merchantRepository.find();
  }

  findOne(id: number) {
    this.logger.log('The item was found', id);

    return this.merchantRepository.findOne({ where: { id } });
  }

  async update(id: number, updateMerchantDto: UpdateMerchantDto) {

    // Find the existing entity
    const merchant = await this.merchantRepository.findOne({ where: { id } });
    if (!merchant) {

      this.logger.error(`Merchant with ID ${id} not found`);

      throw new NotFoundException(`Merchant with ID ${id} not found`);
    }

    // Merge the updated data
    const updatedMerchant = this.merchantRepository.merge(merchant, updateMerchantDto);

    this.logger.log('The item was updated', updateMerchantDto);

    // Save the changes
    return this.merchantRepository.save(updatedMerchant);
  }

  remove(id: number) {
    this.logger.warn('The item was removed', id);
    return this.merchantRepository.delete(id);
  }

  findOneByMerchantId(merchantId: string) {
    this.logger.log('The item was found by MerchantId', merchantId);
    return this.merchantRepository.findOne({ where: { merchantId: merchantId } });
  }

}
